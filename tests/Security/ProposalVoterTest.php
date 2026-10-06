<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Security\ProposalVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class ProposalVoterTest extends AuthorizationTestCase
{
    public function testItAbstainsForUnsupportedSubjectsAndAttributes(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $voter = new ProposalVoter();
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, (new Proposal()), ['wrongAttribute']));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, (new ProposalForm()), [ProposalVoter::CHANGE_CONTENT]));
    }

    public function testAnonymousCannotChangeContentOrStatus(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn('anon.');
        $proposal = (new Proposal());
        $voter = new ProposalVoter();
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $proposal, [ProposalVoter::CHANGE_CONTENT]));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $proposal, [ProposalVoter::CHANGE_STATUS]));
    }

    /** @dataProvider projectManagers */
    public function testAdministratorAndProjectOwnerCanChangeContentAndStatus(bool $administrator): void
    {
        $viewer = new User();
        $project = new Project();
        if ($administrator) {
            $viewer->addRole('ROLE_ADMIN');
        } else {
            $project->setOwner($viewer);
        }
        $proposal = (new Proposal());
        $this->attachProposalToProject($proposal, $project);
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);
        $voter = new ProposalVoter();
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $proposal, [ProposalVoter::CHANGE_CONTENT]));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $proposal, [ProposalVoter::CHANGE_STATUS]));
    }

    /** @return iterable<string, array{bool}> */
    public static function projectManagers(): iterable
    {
        yield 'global administrator' => [true];
        yield 'project owner' => [false];
    }

    public function testAuthorCanChangeContentButNotStatus(): void
    {
        $author = (new User());

        $project = (new Project());
        $project->setOwner(null);
        $proposal = (new Proposal());
        $this->attachProposalToProject($proposal, $project);
        $proposal->setAuthor($author);
        $proposal->setDraft(true);
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($author);
        $voter = new ProposalVoter();
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($token, $proposal, [ProposalVoter::CHANGE_CONTENT]));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $proposal, [ProposalVoter::CHANGE_STATUS]));
    }

    public function testOtherUsersCannotChangeContentOrStatus(): void
    {
        $viewer = (new User());

        $project = (new Project());
        $project->setOwner(null);
        $proposal = (new Proposal());
        $this->attachProposalToProject($proposal, $project);
        $proposal->setAuthor(new User());
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);
        $voter = new ProposalVoter();
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $proposal, [ProposalVoter::CHANGE_CONTENT]));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $proposal, [ProposalVoter::CHANGE_STATUS]));
    }
}
