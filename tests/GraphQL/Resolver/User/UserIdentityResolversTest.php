<?php

namespace Capco\Tests\GraphQL\Resolver\User;

use Capco\Tests\ResponseVisibilityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class UserIdentityResolversTest extends ResponseVisibilityWebTestCase
{
    public function testTheGeneratedRegistrationLinkConfirmsItsAccount(): void
    {
        $user = $this->account()->setConfirmationToken(str_repeat('a', 43));
        $this->em->flush();
        $id = $user->getId();
        $this->browser->request('GET', '/health-check');
        $url = self::getContainer()->get(\Capco\AppBundle\GraphQL\Resolver\User\UserRegistrationConfirmationUrlResolver::class)($user);
        $this->browser->request('GET', $url);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        self::assertTrue($this->reload($id)->isEmailConfirmed());
        $this->assertViewer(true, $id);
        self::assertNull(self::getContainer()->get(\Capco\AppBundle\GraphQL\Resolver\User\UserRegistrationConfirmationUrlResolver::class)($this->reload($id)));
    }

    /**
     * @dataProvider responseViewers
     *
     * @param list<string> $expectedTitles
     */
    public function testResponsesExposeOnlyTheAnswersVisibleToTheViewer(string $viewer, array $expectedTitles): void
    {
        $author = $this->account();
        $this->contribution('Proposal', $author);
        if ('author' === $viewer) {
            $this->login($author->getEmail());
        } elseif ('other' === $viewer) {
            $this->login($this->account()->getEmail());
        }
        $this->em->clear();
        $result = $this->graphql('query($id: ID!) { node(id: $id) { ... on User { responses { edges { node { question { title } } } } } } }', ['id' => GlobalId::toGlobalId('User', $author->getId())]);
        $titles = array_map(static fn (array $edge): string => $edge['node']['question']['title'], $result['node']['responses']['edges']);
        self::assertSame($expectedTitles, $titles);
    }

    /** @return iterable<string, array{string, list<string>}> */
    public static function responseViewers(): iterable
    {
        yield 'anonymous viewer' => ['anonymous', ['Visibility public']];
        yield 'unrelated account' => ['other', ['Visibility public']];
        yield 'author sees private but not hidden answers' => ['author', ['Visibility public', 'Visibility private']];
    }

    public function testTheGeneratedUnsubscribeLinkDisablesOnlyTheRequestedAccountsNotifications(): void
    {
        $user = $this->account();
        $other = $this->account();
        $id = $user->getId();
        $otherId = $other->getId();
        $this->login($user->getEmail());
        $user = $this->reload($id);
        $url = self::getContainer()->get(\Capco\AppBundle\GraphQL\Resolver\User\UserDisableNotificationsUrlResolver::class)($user);
        $this->browser->request('GET', $url);
        self::assertSame('/profile/edit-profile?%23=notifications', $this->browser->getResponse()->headers->get('Location'));
        self::assertFalse($this->reload($id)->getNotificationsConfiguration()->isOnProposalCommentMail());
        self::assertTrue($this->reload($otherId)->getNotificationsConfiguration()->isOnProposalCommentMail());
    }

    public function testTheArchiveLinkAuthenticatesItsAccountAndOpensTheExportSection(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $this->browser->request('GET', '/health-check');
        $url = self::getContainer()->get(\Capco\AppBundle\GraphQL\Resolver\User\UserLoginAndShowDataUrlResolver::class)($user);
        $this->browser->request('GET', $url);
        self::assertSame('/profile/edit-profile?%23=export', $this->browser->getResponse()->headers->get('Location'));
        $this->assertViewer(true, $id);
    }

    public function testTheNotificationPreferencesLinkOpensTheEditableProfile(): void
    {
        $this->login($this->account()->getEmail());
        $this->setFeature('server_side_rendering', false);
        $url = self::getContainer()->get(\Capco\AppBundle\GraphQL\Resolver\User\UserShowNotificationsPreferencesUrlResolver::class)();
        parse_str((string) parse_url((string) $url, \PHP_URL_QUERY), $parameters);
        self::assertSame('notifications', $parameters['#']);
        $this->browser->request('GET', $url);
        self::assertSame(200, $this->browser->getResponse()->getStatusCode());
        self::assertStringContainsString('EditProfileApp', (string) $this->browser->getResponse()->getContent());
    }

    public function testThePasswordResetLinkOpensTheFormForItsResetToken(): void
    {
        $user = $this->account()->setResetPasswordToken('reset-token-' . bin2hex(random_bytes(8)));
        $user->setPasswordRequestedAt(new \DateTime());
        $this->em->flush();
        $this->setFeature('server_side_rendering', false);
        $url = self::getContainer()->get(\Capco\AppBundle\GraphQL\Resolver\User\UserResettingPasswordUrlResolver::class)($user);
        $this->browser->request('GET', $url);
        self::assertSame(200, $this->browser->getResponse()->getStatusCode());
        self::assertStringContainsString($user->getResetPasswordToken(), (string) $this->browser->getResponse()->getContent());
    }

    /**
     * @dataProvider postQueries
     *
     * @param list<string> $expectedTitles
     */
    public function testThePostsConnectionSearchesAndPaginatesOnlyTheRequestedOwnersPosts(string $arguments, array $expectedTitles, int $total, bool $hasNextPage): void
    {
        $author = $this->account();
        $otherAuthor = $this->account();
        foreach ([
            ['Earlier matching article', $author, '2020-01-01'],
            ['Later matching article', $author, '2020-01-03'],
            ['Unrelated article', $author, '2020-01-02'],
            ['Another owners matching article', $otherAuthor, '2020-01-04'],
        ] as [$title, $owner, $date]) {
            $post = (new \Capco\AppBundle\Entity\Post())->setTitle($title)->setBody($title)->setOwner($owner)->setCreator($owner)->setIsPublished(true)->setPublishedAt(new \DateTime('2020-01-01'));
            $post->mergeNewTranslations();
            $this->em->persist($post);
            $this->em->flush();
            $post->setUpdatedAt(new \DateTime($date));
            $this->em->flush();
            $this->indexForSearch(\Capco\AppBundle\Entity\Post::class, $post->getId());
        }
        $this->em->clear();

        $result = $this->graphql('query($id: ID!) { node(id: $id) { ... on User { posts' . $arguments . ' { totalCount pageInfo { hasNextPage } edges { node { title } } } } } }', ['id' => GlobalId::toGlobalId('User', $author->getId())]);

        self::assertSame($total, $result['node']['posts']['totalCount']);
        self::assertSame($expectedTitles, array_column(array_column($result['node']['posts']['edges'], 'node'), 'title'));
        self::assertSame($hasNextPage, $result['node']['posts']['pageInfo']['hasNextPage']);
    }

    /** @return iterable<string, array{string, list<string>, int, bool}> */
    public static function postQueries(): iterable
    {
        yield 'search and ascending order' => ['(first: 100, affiliations: [OWNER], query: "matching", orderBy: {field: UPDATED_AT, direction: ASC})', ['Earlier matching article', 'Later matching article'], 2, false];
        yield 'default descending order and pagination' => ['(first: 1, affiliations: [OWNER])', ['Later matching article'], 3, true];
        yield 'no matching post' => ['(first: 100, affiliations: [OWNER], query: "absentword")', [], 0, false];
    }
}
