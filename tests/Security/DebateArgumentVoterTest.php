<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Security\DebateArgumentVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class DebateArgumentVoterTest extends AuthorizationTestCase
{
    public function testAnonymousCannotUpdateDeleteOrParticipate(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn('anon.');
        $voter = new DebateArgumentVoter();
        $argument = (new DebateArgument(new Debate()));

        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $argument, [DebateArgumentVoter::UPDATE]));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $argument, [DebateArgumentVoter::DELETE]));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, (new DebateAnonymousArgument(new Debate())), [DebateArgumentVoter::PARTICIPATE]));
    }

    public function testAuthorCanUpdateAndDeleteTheirArgument(): void
    {
        $user = (new User());

        $argument = (new DebateArgument(new Debate()));
        $argument->setAuthor($user);
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);
        $voter = new DebateArgumentVoter();

        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $argument, [DebateArgumentVoter::UPDATE]));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $argument, [DebateArgumentVoter::DELETE]));
    }

    public function testAdministratorCanDeleteAnotherUsersArgument(): void
    {
        $user = (new User());
        $user->addRole('ROLE_ADMIN');
        $argument = (new DebateArgument(new Debate()));
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        self::assertSame(VoterInterface::ACCESS_GRANTED, (new DebateArgumentVoter())->vote($token, $argument, [DebateArgumentVoter::DELETE]));
    }

    /** @dataProvider participationRoles */
    public function testParticipationFollowsDebateAvailabilityEvenForAnAdministrator(string $role): void
    {
        $user = new User();
        $user->addRole($role);
        $debate = (new Debate());
        $argument = (new DebateArgument(new Debate()));
        $argument->setDebate($debate);
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);
        $voter = new DebateArgumentVoter();
        $this->attachDebateToProject($debate, new \Capco\AppBundle\Entity\Project());

        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $argument, [DebateArgumentVoter::PARTICIPATE]));
        $debate->getStep()->setTimeless(false)->setEndAt(new \DateTime('2000-01-01'));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $argument, [DebateArgumentVoter::PARTICIPATE]));
    }

    /** @return iterable<string, array{string}> */
    public static function participationRoles(): iterable
    {
        yield 'ordinary participant' => ['ROLE_USER'];
        yield 'administrator participant' => ['ROLE_ADMIN'];
    }

    /** @dataProvider otherAuthors */
    public function testAnotherAuthorsArgumentCannotBeUpdatedAndOnlyAdminsCanDeleteIt(string $role, int $deleteVote): void
    {
        $viewer = (new User())->setId('viewer-id')->addRole($role);
        $author = (new User())->setId('author-id');
        $argument = (new DebateArgument(new Debate()))->setAuthor($author);
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);
        $voter = new DebateArgumentVoter();

        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $argument, [DebateArgumentVoter::UPDATE]));
        self::assertSame($deleteVote, $voter->vote($token, $argument, [DebateArgumentVoter::DELETE]));
    }

    /** @return iterable<string, array{string, int}> */
    public static function otherAuthors(): iterable
    {
        yield 'ordinary account' => ['ROLE_USER', VoterInterface::ACCESS_DENIED];
        yield 'project administrator' => ['ROLE_PROJECT_ADMIN', VoterInterface::ACCESS_DENIED];
        yield 'global administrator' => ['ROLE_ADMIN', VoterInterface::ACCESS_GRANTED];
    }

    public function testItAbstainsForUnsupportedSubjectsAndAttributes(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $voter = new DebateArgumentVoter();

        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new User(), [DebateArgumentVoter::UPDATE]));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new DebateArgument(new Debate()), ['unknown']));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new DebateAnonymousArgument(new Debate()), [DebateArgumentVoter::UPDATE]));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new DebateAnonymousArgument(new Debate()), [DebateArgumentVoter::DELETE]));
    }
}
