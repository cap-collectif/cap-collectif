<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class ProposalAnalysisRelatedVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ProposalAnalysisRelatedVoter::class);
    }

    public function it_forbid_anonymous_to_do_anything(
        Proposal $proposal,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ANALYSE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::EVALUATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::DECIDE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ASSIGN_SUPERVISOR])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ASSIGN_ANALYST])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $proposal, [
            ProposalAnalysisRelatedVoter::ASSIGN_DECISION_MAKER,
        ])->shouldBe(VoterInterface::ACCESS_DENIED);
    }

    public function it_should_allow_admin_to_view_and_revise(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(true);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::REVISE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_project_admin_to_view_and_revise_his_proposal(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getProjectOwner()->willReturn($viewer);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::REVISE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_decision_maker_to_view_and_revise(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getProjectOwner()->willReturn(null);
        $proposal->getDecisionMaker()->willReturn($viewer);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::REVISE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_supervisor_to_view_and_revise(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getProjectOwner()->willReturn(null);
        $proposal->getDecisionMaker()->willReturn(null);
        $proposal->getSupervisor()->willReturn($viewer);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::REVISE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_assigned_analyst_to_view_and_revise(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer,
        ArrayCollection $analysts
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getProjectOwner()->willReturn(null);
        $proposal->getDecisionMaker()->willReturn(null);
        $proposal->getSupervisor()->willReturn($viewer);
        $proposal->getAnalysts()->willReturn($analysts);
        $analysts->contains($viewer)->willReturn(true);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::REVISE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_forbid_to_view_and_revise_when_not_meeting_requirements(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer,
        ArrayCollection $analysts
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getProjectOwner()->willReturn(null);
        $proposal->getDecisionMaker()->willReturn(null);
        $proposal->getSupervisor()->willReturn(null);
        $proposal->getAnalysts()->willReturn($analysts);
        $analysts->contains($viewer)->willReturn(false);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::REVISE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_allow_assigned_analyst_to_analyse(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer,
        ArrayCollection $analysts
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $proposal->getAnalysts()->willReturn($analysts);
        $analysts->contains($viewer)->willReturn(true);
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ANALYSE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_forbid_not_assigned_analyst_to_analyse(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer,
        ArrayCollection $analysts
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $proposal->getAnalysts()->willReturn($analysts);
        $analysts->contains($viewer)->willReturn(false);
        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ANALYSE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_allow_supervisor_to_evaluate_not_done_proposal(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer,
        ProposalDecision $decision
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $proposal->getDecision()->willReturn($decision);
        $decision->getState()->willReturn(ProposalStatementState::IN_PROGRESS);

        $proposal->getSupervisor()->willReturn($viewer);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::EVALUATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_forbid_not_assigned_supervisor_to_evaluate_not_done_proposal(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer,
        ProposalDecision $decision
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $proposal->getDecision()->willReturn($decision);
        $decision->getState()->willReturn(ProposalStatementState::IN_PROGRESS);

        $proposal->getSupervisor()->willReturn(null);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::EVALUATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_forbid_to_evaluate_done_proposal(
        Proposal $proposal,
        TokenInterface $token,
        ProposalDecision $decision
    ): void {
        $proposal->getDecision()->willReturn($decision);
        $decision->getState()->willReturn(ProposalStatementState::DONE);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::EVALUATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_allow_assigned_decision_maker_to_decide(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $proposal->getDecisionMaker()->willReturn($viewer);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::DECIDE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_forbid_not_assigned_decision_maker_to_decide(
        Proposal $proposal,
        TokenInterface $token
    ): void {
        $proposal->getDecisionMaker()->willReturn(null);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::DECIDE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_allow_admin_to_assign_supervisor(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(true);
        $proposal->getProjectOwner()->willReturn(null);
        $proposal->getDecisionMaker()->willReturn(null);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ASSIGN_SUPERVISOR])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_project_admin_to_assign_supervisor_on_his_proposal(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getProjectOwner()->willReturn($viewer);
        $proposal->getDecisionMaker()->willReturn(null);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ASSIGN_SUPERVISOR])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_decision_maker_to_assign_supervisor(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getProjectOwner()->willReturn(null);
        $proposal->getDecisionMaker()->willReturn($viewer);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ASSIGN_SUPERVISOR])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_admin_to_assign_decision_maker(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(true);
        $proposal->getProjectOwner()->willReturn(null);

        $this->vote($token, $proposal, [
            ProposalAnalysisRelatedVoter::ASSIGN_DECISION_MAKER,
        ])->shouldBe(VoterInterface::ACCESS_GRANTED);
    }

    public function it_should_allow_project_admin_to_assign_decision_maker_on_his_project(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getProjectOwner()->willReturn($viewer);

        $this->vote($token, $proposal, [
            ProposalAnalysisRelatedVoter::ASSIGN_DECISION_MAKER,
        ])->shouldBe(VoterInterface::ACCESS_GRANTED);
    }

    public function it_should_allow_admin_to_assign_analyst(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(true);
        $proposal->getProjectOwner()->willReturn(null);
        $proposal->getDecisionMaker()->willReturn(null);
        $proposal->getSupervisor()->willReturn(null);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ASSIGN_ANALYST])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_project_admin_to_assign_analyst_on_his_project(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getProjectOwner()->willReturn($viewer);
        $proposal->getDecisionMaker()->willReturn(null);
        $proposal->getSupervisor()->willReturn(null);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ASSIGN_ANALYST])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_decision_maker_to_assign_analyst(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getProjectOwner()->willReturn(null);
        $proposal->getDecisionMaker()->willReturn($viewer);
        $proposal->getSupervisor()->willReturn(null);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ASSIGN_ANALYST])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_supervisor_to_assign_analyst(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getProjectOwner()->willReturn(null);
        $proposal->getDecisionMaker()->willReturn(null);
        $proposal->getSupervisor()->willReturn($viewer);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ASSIGN_ANALYST])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_assigned_analyst_to_assign_analyst(
        Proposal $proposal,
        TokenInterface $token,
        User $viewer,
        ArrayCollection $analysts
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer->isAdmin()->willReturn(false);
        $proposal->getProjectOwner()->willReturn(null);
        $proposal->getDecisionMaker()->willReturn(null);
        $proposal->getSupervisor()->willReturn(null);

        $proposal->getAnalysts()->willReturn($analysts);
        $analysts->contains($viewer)->willReturn(true);

        $this->vote($token, $proposal, [ProposalAnalysisRelatedVoter::ASSIGN_ANALYST])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_does_not_supports_attribute(
        User $user,
        Proposal $proposal,
        TokenInterface $token
    ): void {
        $this->vote($token, $user, [ProposalAnalysisRelatedVoter::VIEW])->shouldBe(
            VoterInterface::ACCESS_ABSTAIN
        );
        $this->vote($token, $proposal, ['abc'])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
    }
}
