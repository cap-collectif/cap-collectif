<?php

namespace Capco\Tests\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Participant;
use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 *
 * @runTestsInSeparateProcesses
 *
 * @preserveGlobalState disabled
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks the public GraphQL name, avatar and profile link with real persisted accounts over HTTP.
 */
final class AnonymizedProfileTest extends IdentityWebTestCase
{
    /** @dataProvider anonymizedAccounts */
    public function testAnonymizedAccountsHaveANeutralPublicIdentity(bool $deleted, bool $anonymized): void
    {
        $user = $this->account()->setUsername('global.user.anonymized');
        if ($deleted) {
            $user->setDeletedAccountAt(new \DateTime('2020-01-01'));
        }
        if ($anonymized) {
            $user->setAnonymizedAt(new \DateTime('2020-01-01'));
        }
        $this->em->flush();
        $this->em->clear();

        $result = $this->graphql(
            'query($id:ID!){node(id:$id){...on Contributor{isAnonymized} ...on User{username displayName avatarUrl url}}}',
            ['id' => GlobalId::toGlobalId('User', $user->getId())]
        );

        self::assertSame([
            'isAnonymized' => true,
            'username' => 'global.user.anonymized',
            'displayName' => 'global.user.anonymized',
            'avatarUrl' => '/svg/anonymized-profile.svg',
            'url' => '',
        ], $result['node']);
    }

    /** @return iterable<string, array{bool, bool}> */
    public static function anonymizedAccounts(): iterable
    {
        yield 'manually deleted or API anonymized' => [true, false];

        yield 'anonymization timestamp only' => [false, true];

        yield 'both timestamps' => [true, true];
    }

    public function testAnAccountWithoutAUsernameKeepsANullUsernameAndAFallbackDisplayName(): void
    {
        $user = $this->account()->setUsername(null);
        $this->em->flush();
        $this->em->clear();

        $result = $this->graphql(
            'query($id:ID!){node(id:$id){...on User{username displayName}}}',
            ['id' => GlobalId::toGlobalId('User', $user->getId())]
        );

        self::assertSame(['username' => null, 'displayName' => 'Utilisateur sans nom'], $result['node']);
    }

    /** @dataProvider activeAccountNames */
    public function testActiveAccountsRetainTheirPublicIdentity(string $username): void
    {
        $user = $this->account()->setUsername($username);
        $this->em->flush();

        $result = $this->graphql(
            'query($id:ID!){node(id:$id){...on User{username displayName avatarUrl url isAnonymized}}}',
            ['id' => GlobalId::toGlobalId('User', $user->getId())]
        );

        self::assertSame($username, $result['node']['username']);
        self::assertSame($username, $result['node']['displayName']);
        self::assertFalse($result['node']['isAnonymized']);
        self::assertNull($result['node']['avatarUrl']);
        self::assertStringContainsString('/profile/', $result['node']['url']);
    }

    /** @return iterable<string, array{string}> */
    public static function activeAccountNames(): iterable
    {
        yield 'ordinary name' => ['Active author'];

        yield 'anonymized label without markers' => ['global.user.anonymized'];
    }

    /** @dataProvider participantStates */
    public function testParticipantStatusUsesItsAnonymizationTimestamp(?string $username, bool $anonymized): void
    {
        $participant = (new Participant())->setToken(bin2hex(random_bytes(24)))->setUsername($username);
        if ($anonymized) {
            $participant->setAnonymizedAt(new \DateTime('2020-01-01'));
        }
        $this->em->persist($participant);
        $this->em->flush();
        $this->em->clear();

        $result = $this->graphql(
            'query($id:ID!){node(id:$id){...on Contributor{isAnonymized avatarUrl}}}',
            ['id' => GlobalId::toGlobalId('Contributor', $participant->getId())]
        );

        self::assertSame([
            'isAnonymized' => $anonymized,
            'avatarUrl' => $anonymized ? '/svg/anonymized-profile.svg' : null,
        ], $result['node']);
    }

    /** @return iterable<string, array{?string, bool}> */
    public static function participantStates(): iterable
    {
        yield 'active participant' => ['Alice', false];

        yield 'anonymized label without a marker' => ['global.user.anonymized', false];

        yield 'anonymized participant without a name' => [null, true];

        yield 'anonymized participant with a legacy label' => ['Participant supprimé', true];
    }
}
