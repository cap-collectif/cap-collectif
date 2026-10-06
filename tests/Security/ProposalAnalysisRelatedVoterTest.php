<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class ProposalAnalysisRelatedVoterTest extends AuthorizationTestCase
{
    public function testAnonymousCannotUseAnalysisActions(): void
    {
        $token = $this->token('anon.');
        $voter = new ProposalAnalysisRelatedVoter();
        $proposal = (new Proposal());
        foreach ([ProposalAnalysisRelatedVoter::ANALYSE, ProposalAnalysisRelatedVoter::EVALUATE, ProposalAnalysisRelatedVoter::VIEW, ProposalAnalysisRelatedVoter::REVISE, ProposalAnalysisRelatedVoter::DECIDE, ProposalAnalysisRelatedVoter::ASSIGN_SUPERVISOR, ProposalAnalysisRelatedVoter::ASSIGN_ANALYST, ProposalAnalysisRelatedVoter::ASSIGN_DECISION_MAKER] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($token, $proposal, [$attribute]));
        }
    }

    public function testAdministratorsAndProjectOwnersCanViewAndRevise(): void
    {
        $admin = (new User());
        $admin->addRole('ROLE_ADMIN');
        $proposal = (new Proposal());
        $this->attachProposalToProject($proposal, (new Project()));
        $voter = new ProposalAnalysisRelatedVoter();
        foreach ([ProposalAnalysisRelatedVoter::VIEW, ProposalAnalysisRelatedVoter::REVISE] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($admin), $proposal, [$attribute]));
        }

        $owner = (new User());

        $project = (new Project());
        $project->setOwner($owner);
        $ownedProposal = (new Proposal());
        $this->attachProposalToProject($ownedProposal, $project);
        foreach ([ProposalAnalysisRelatedVoter::VIEW, ProposalAnalysisRelatedVoter::REVISE] as $attribute) {
            self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($owner), $ownedProposal, [$attribute]));
        }
    }

    /** @dataProvider assignments */
    public function testDecisionMakerSupervisorAndAnalystCanViewAndReviseTheirAssignment(string $role, int $expected): void
    {
        $user = new User();
        $proposal = new Proposal();
        $this->attachProposalToProject($proposal, new Project());
        if ('decisionMaker' === $role) {
            $proposal->setProposalDecisionMaker(new \Capco\AppBundle\Entity\ProposalDecisionMaker($proposal, $user));
        } elseif ('supervisor' === $role) {
            $proposal->setSupervisor(new \Capco\AppBundle\Entity\ProposalSupervisor($proposal, $user));
        } elseif ('analyst' === $role) {
            $proposal->addAnalysts([$user]);
        }
        $voter = new ProposalAnalysisRelatedVoter();

        foreach ([ProposalAnalysisRelatedVoter::VIEW, ProposalAnalysisRelatedVoter::REVISE] as $attribute) {
            self::assertSame($expected, $voter->vote($this->token($user), $proposal, [$attribute]));
        }
    }

    /** @return iterable<string, array{string, int}> */
    public static function assignments(): iterable
    {
        yield 'assigned decision maker' => ['decisionMaker', VoterInterface::ACCESS_GRANTED];
        yield 'assigned supervisor' => ['supervisor', VoterInterface::ACCESS_GRANTED];
        yield 'assigned analyst' => ['analyst', VoterInterface::ACCESS_GRANTED];
        yield 'unassigned viewer' => ['none', VoterInterface::ACCESS_DENIED];
    }

    public function testOnlyAssignedAnalystsCanAnalyseAndOnlyDecisionMakersCanDecide(): void
    {
        $user = (new User());
        $proposal = (new Proposal());
        $proposal->addAnalysts([$user]);
        $proposal->setProposalDecisionMaker(new \Capco\AppBundle\Entity\ProposalDecisionMaker($proposal, $user));
        $voter = new ProposalAnalysisRelatedVoter();
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($user), $proposal, [ProposalAnalysisRelatedVoter::ANALYSE]));
        self::assertSame(VoterInterface::ACCESS_GRANTED, $voter->vote($this->token($user), $proposal, [ProposalAnalysisRelatedVoter::DECIDE]));
        $other = (new User());
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token($other), $proposal, [ProposalAnalysisRelatedVoter::ANALYSE]));
        self::assertSame(VoterInterface::ACCESS_DENIED, $voter->vote($this->token($other), $proposal, [ProposalAnalysisRelatedVoter::DECIDE]));
    }

    /** @dataProvider evaluationRights */
    public function testOnlyAssignedSupervisorCanEvaluateAnUndecidedProposal(bool $assigned, string $state, int $expected): void
    {
        $viewer = new User();
        $proposal = new Proposal();
        $proposal->setDecision((new ProposalDecision($proposal))->setState($state));
        $proposal->setSupervisor(new \Capco\AppBundle\Entity\ProposalSupervisor($proposal, $assigned ? $viewer : new User()));

        self::assertSame($expected, (new ProposalAnalysisRelatedVoter())->vote($this->token($viewer), $proposal, [ProposalAnalysisRelatedVoter::EVALUATE]));
    }

    /** @return iterable<string, array{bool, string, int}> */
    public static function evaluationRights(): iterable
    {
        yield 'assigned supervisor with pending decision' => [true, ProposalStatementState::IN_PROGRESS, VoterInterface::ACCESS_GRANTED];
        yield 'unassigned viewer with pending decision' => [false, ProposalStatementState::IN_PROGRESS, VoterInterface::ACCESS_DENIED];
        yield 'assigned supervisor with completed decision' => [true, ProposalStatementState::DONE, VoterInterface::ACCESS_DENIED];
    }

    /**
     * @dataProvider assignmentRights
     *
     * @param list<int> $expected
     */
    public function testAssignmentRightsFollowProjectAndAssignedRoles(string $role, array $expected): void
    {
        $viewer = new User();
        $project = new Project();
        $proposal = new Proposal();
        $this->attachProposalToProject($proposal, $project);
        if ('admin' === $role) {
            $viewer->addRole('ROLE_ADMIN');
        } elseif ('owner' === $role) {
            $viewer->addRole('ROLE_PROJECT_ADMIN');
            $project->setOwner($viewer);
        } elseif ('decisionMaker' === $role) {
            $proposal->setProposalDecisionMaker(new \Capco\AppBundle\Entity\ProposalDecisionMaker($proposal, $viewer));
        } elseif ('supervisor' === $role) {
            $proposal->setSupervisor(new \Capco\AppBundle\Entity\ProposalSupervisor($proposal, $viewer));
        } elseif ('analyst' === $role) {
            $proposal->addAnalysts([$viewer]);
        }
        $voter = new ProposalAnalysisRelatedVoter();
        foreach ([ProposalAnalysisRelatedVoter::ASSIGN_SUPERVISOR, ProposalAnalysisRelatedVoter::ASSIGN_ANALYST, ProposalAnalysisRelatedVoter::ASSIGN_DECISION_MAKER] as $index => $attribute) {
            self::assertSame($expected[$index], $voter->vote($this->token($viewer), $proposal, [$attribute]), $attribute);
        }
    }

    /** @return iterable<string, array{string, list<int>}> */
    public static function assignmentRights(): iterable
    {
        yield 'global administrator' => ['admin', [VoterInterface::ACCESS_GRANTED, VoterInterface::ACCESS_GRANTED, VoterInterface::ACCESS_GRANTED]];
        yield 'project owner' => ['owner', [VoterInterface::ACCESS_GRANTED, VoterInterface::ACCESS_GRANTED, VoterInterface::ACCESS_GRANTED]];
        yield 'assigned decision maker' => ['decisionMaker', [VoterInterface::ACCESS_GRANTED, VoterInterface::ACCESS_GRANTED, VoterInterface::ACCESS_DENIED]];
        yield 'assigned supervisor' => ['supervisor', [VoterInterface::ACCESS_DENIED, VoterInterface::ACCESS_GRANTED, VoterInterface::ACCESS_DENIED]];
        yield 'assigned analyst' => ['analyst', [VoterInterface::ACCESS_DENIED, VoterInterface::ACCESS_GRANTED, VoterInterface::ACCESS_DENIED]];
        yield 'unassigned viewer' => ['none', [VoterInterface::ACCESS_DENIED, VoterInterface::ACCESS_DENIED, VoterInterface::ACCESS_DENIED]];
    }

    public function testItAbstainsForUnsupportedSubjectsAndAttributes(): void
    {
        $voter = new ProposalAnalysisRelatedVoter();
        $token = $this->token(new User());
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, new ProposalForm(), [ProposalAnalysisRelatedVoter::VIEW]));
        self::assertSame(VoterInterface::ACCESS_ABSTAIN, $voter->vote($token, (new Proposal()), ['unknown']));
    }

    private function token(mixed $user): TokenInterface
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        return $token;
    }
}
