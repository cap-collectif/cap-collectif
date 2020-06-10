<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\ProposalAssessment;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Entity\Interfaces\Trashable;

class ProposalSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Proposal::class);
    }

    public function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }

    public function it_is_a_trashable()
    {
        $this->shouldImplement(Trashable::class);
    }

    public function it_is_displayable_in_bo()
    {
        $this->shouldImplement(DisplayableInBOInterface::class);
    }

    public function it_can_be_seen_in_BO_only_by_admin_or_super_admin(
        User $viewer,
        Proposal $proposal
    ): void {
        $viewer->isAdmin()->willReturn(false);
        $proposal->viewerCanSeeInBo($viewer)->willReturn(false);

        $viewer->isAdmin()->willReturn(true);
        $proposal->viewerCanSeeInBo($viewer)->willReturn(true);
    }

    public function it_can_be_seen_by_admin_or_super_admin(User $viewer, Proposal $proposal): void
    {
        $viewer->isAdmin()->willReturn(true);
        $proposal->viewerCanSee($viewer)->willReturn(true);
    }

    public function it_can_be_seen_by_author_if_not_published(
        User $viewer,
        Proposal $proposal
    ): void {
        $viewer->isAdmin()->willReturn(false);
        $proposal->isPublished()->willReturn(false);
        $proposal->getAuthor()->willReturn($viewer);
        $proposal->viewerCanSee($viewer)->willReturn(true);
    }

    public function it_should_return_todo_progress_status()
    {
        $this->setDecision(null)
            ->setAssessment(null)
            ->setAnalyses([]);
        $this->getGlobalProgressStatus()->shouldReturn(ProposalStatementState::TODO);
    }

    public function it_should_return_favourable_progress_status(ProposalDecision $decision)
    {
        $decision->getState()->willReturn(ProposalStatementState::FAVOURABLE);
        $this->setDecision($decision);
        $this->getGlobalProgressStatus()->shouldReturn(ProposalStatementState::FAVOURABLE);
    }

    public function it_should_return_unfavourable_progress_status(
        ProposalAssessment $proposalAssessment
    ) {
        $proposalAssessment->getState()->willReturn(ProposalStatementState::UNFAVOURABLE);
        $this->setAssessment($proposalAssessment);
        $this->getGlobalProgressStatus()->shouldReturn(ProposalStatementState::IN_PROGRESS);
    }

    public function it_should_return_in_progress_progress_status(
        ProposalAnalysis $proposalAnalysis1,
        ProposalAnalysis $proposalAnalysis2,
        ProposalAnalysis $proposalAnalysis3
    ) {
        $proposalAnalysis1->getState()->willReturn(ProposalStatementState::TODO);
        $proposalAnalysis2->getState()->willReturn(ProposalStatementState::IN_PROGRESS);
        $proposalAnalysis3->getState()->willReturn(ProposalStatementState::IN_PROGRESS);

        $this->setAnalyses([$proposalAnalysis1, $proposalAnalysis2, $proposalAnalysis3]);
        $this->getGlobalProgressStatus()->shouldReturn(ProposalStatementState::IN_PROGRESS);
    }

    public function it_should_return_analysis_favourable_progress_status(
        ProposalAnalysis $proposalAnalysis1,
        ProposalAnalysis $proposalAnalysis2,
        ProposalAnalysis $proposalAnalysis3,
        ProposalAnalysis $proposalAnalysis4
    ) {
        $proposalAnalysis1->getState()->willReturn(ProposalStatementState::TODO);
        $proposalAnalysis2->getState()->willReturn(ProposalStatementState::IN_PROGRESS);
        $proposalAnalysis3->getState()->willReturn(ProposalStatementState::IN_PROGRESS);
        $proposalAnalysis4->getState()->willReturn(ProposalStatementState::FAVOURABLE);

        $this->setAnalyses([
            $proposalAnalysis1,
            $proposalAnalysis2,
            $proposalAnalysis3,
            $proposalAnalysis4,
        ]);

        $this->getGlobalProgressStatus()->shouldReturn(ProposalStatementState::IN_PROGRESS);
    }
}
