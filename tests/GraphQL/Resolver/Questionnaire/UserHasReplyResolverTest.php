<?php

namespace Capco\Tests\GraphQL\Resolver\Questionnaire;

use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class UserHasReplyResolverTest extends IdentityWebTestCase
{
    /** @dataProvider replyStates */
    public function testTheEmailLookupFindsOnlyRepliesInTheRequestedQuestionnaire(string $replyLocation, bool $exists, bool $expected, string $viewer): void
    {
        $user = $this->account();
        $questionnaire = $this->em->getRepository(\Capco\AppBundle\Entity\Questionnaire::class)->findOneBy([]);
        self::assertNotNull($questionnaire);
        if ('none' !== $replyLocation) {
            $replyQuestionnaire = 'requested' === $replyLocation ? $questionnaire : (new \Capco\AppBundle\Entity\Questionnaire())->setTitle('Unrelated questionnaire');
            $this->em->persist($replyQuestionnaire);
            $reply = (new \Capco\AppBundle\Entity\Reply())->setAuthor($user)->setQuestionnaire($replyQuestionnaire)->setDraft(false);
            $this->em->persist($reply);
            $this->em->flush();
        }
        if ('admin' === $viewer) {
            $admin = $this->account()->addRole('ROLE_ADMIN');
            $this->em->flush();
            $this->login($admin->getEmail());
        } elseif ('author' === $viewer) {
            $this->login($user->getEmail());
        } elseif ('other' === $viewer) {
            $this->login($this->account()->getEmail());
        }
        $result = $this->graphql('query($id: ID!, $login: String!) { node(id: $id) { ... on Questionnaire { userHasReply(login: $login) } } }', ['id' => GlobalId::toGlobalId('Questionnaire', $questionnaire->getId()), 'login' => $exists ? $user->getEmail() : $this->uniqueEmail()]);
        self::assertSame($expected, $result['node']['userHasReply']);
    }

    /** @return iterable<string, array{string, bool, bool, string}> */
    public static function replyStates(): iterable
    {
        yield 'account with reply' => ['requested', true, true, 'admin'];
        yield 'account without reply' => ['none', true, false, 'admin'];
        yield 'reply in another questionnaire' => ['other', true, false, 'admin'];
        yield 'author can see their participation' => ['requested', true, true, 'author'];
        yield 'visitor cannot look up participation' => ['requested', true, false, 'anonymous'];
        yield 'another account cannot look up participation' => ['requested', true, false, 'other'];
        yield 'unknown email' => ['requested', false, false, 'admin'];
    }
}
