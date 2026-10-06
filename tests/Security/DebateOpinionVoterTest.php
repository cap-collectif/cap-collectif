<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Security\DebateOpinionVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class DebateOpinionVoterTest extends AuthorizationTestCase
{
    public function testAnonymousCannotCreateEditOrDeleteDebateOpinions(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn('anon.');
        $opinion = (new DebateOpinion());
        $voter = new DebateOpinionVoter();

        foreach ([DebateOpinionVoter::CREATE, DebateOpinionVoter::EDIT, DebateOpinionVoter::DELETE] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $opinion, [$attribute]));
        }
    }

    public function testProjectAdminCanCreateDebateOpinions(): void
    {
        $viewer = (new User());
        $viewer->addRole('ROLE_PROJECT_ADMIN');
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);

        self::assertSame(VoterInterface::ACCESS_GRANTED, (new DebateOpinionVoter())->vote($token, new DebateOpinion(), [DebateOpinionVoter::CREATE]));
    }

    public function testProjectAdminCanEditAndDeleteOpinionOnOwnedProject(): void
    {
        $viewer = (new User());

        $viewer->addRole('ROLE_PROJECT_ADMIN');
        $project = (new Project());
        $project->setOwner($viewer);
        $debate = (new Debate());
        $this->attachDebateToProject($debate, $project);
        $opinion = (new DebateOpinion());
        $opinion->setDebate($debate);
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);

        $voter = new DebateOpinionVoter();
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $opinion, [DebateOpinionVoter::EDIT]));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $opinion, [DebateOpinionVoter::DELETE]));
    }

    public function testAuthorCanEditAndDeleteTheirOpinion(): void
    {
        $viewer = (new User());

        $project = (new Project());
        $project->setOwner(null);
        $debate = (new Debate());
        $this->attachDebateToProject($debate, $project);
        $opinion = (new DebateOpinion());
        $opinion->setDebate($debate);
        $opinion->setAuthor($viewer);
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);

        $voter = new DebateOpinionVoter();
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $opinion, [DebateOpinionVoter::EDIT]));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $opinion, [DebateOpinionVoter::DELETE]));
    }

    public function testItAbstainsForUnsupportedAttributesOrSubjects(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $opinion = (new DebateOpinion());
        $voter = new DebateOpinionVoter();

        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new User(), [DebateOpinionVoter::CREATE]));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, $opinion, ['unknown']));
    }

    /** @dataProvider unrelatedViewers */
    public function testConnectedViewersWithoutOwnershipOrAuthorshipCannotManageAnOpinion(string $role, int $createVote): void
    {
        $viewer = (new User())->setId('viewer-id')->addRole($role);
        $project = (new Project())->setOwner((new User())->setId('project-owner-id'));
        $debate = new Debate();
        $this->attachDebateToProject($debate, $project);
        $opinion = (new DebateOpinion())->setDebate($debate)->setAuthor((new User())->setId('opinion-author-id'));
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);
        $voter = new DebateOpinionVoter();

        self::assertSame($createVote, $voter->vote($token, $opinion, [DebateOpinionVoter::CREATE]));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $opinion, [DebateOpinionVoter::EDIT]));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $opinion, [DebateOpinionVoter::DELETE]));
    }

    /** @return iterable<string, array{string, int}> */
    public static function unrelatedViewers(): iterable
    {
        yield 'ordinary account cannot create or manage' => ['ROLE_USER', VoterInterface::ACCESS_DENIED];
        yield 'project administrator can create but cannot manage this opinion' => ['ROLE_PROJECT_ADMIN', VoterInterface::ACCESS_GRANTED];
    }
}
