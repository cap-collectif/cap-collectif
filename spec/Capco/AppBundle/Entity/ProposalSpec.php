<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\ProposalAnalyst;
use Capco\AppBundle\Entity\ProposalAssessment;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
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
        $this->viewerCanSeeInBo($viewer)->shouldReturn(false);

        $viewer->isAdmin()->willReturn(true);
        $this->viewerCanSeeInBo($viewer)->shouldReturn(true);
    }

    public function it_can_be_seen_by_admin_or_super_admin(User $viewer, Proposal $proposal): void
    {
        $viewer->isAdmin()->willReturn(true);
        $this->viewerCanSee($viewer)->shouldReturn(true);
    }

    public function it_can_be_seen_by_author_if_not_published(
        User $viewer,
        ProposalForm $proposalForm,
        CollectStep $collectStep
    ): void {
        $collectStep->isPrivate()->willReturn(true);
        $proposalForm->getStep()->willReturn($collectStep);
        $viewer->isAdmin()->willReturn(false);
        $this->setProposalForm($proposalForm);
        $this->setProposalDecisionMaker(null);
        $this->setSupervisor(null);
        $this->isPublished()->shouldReturn(false);
        $this->setAuthor($viewer);
        $this->viewerCanSee($viewer)->shouldReturn(true);
    }

    public function it_can_not_be_seen_by_anonymous_if_step_is_private(
        User $author,
        ProposalForm $proposalForm,
        CollectStep $collectStep
    ): void {
        $collectStep->isPrivate()->willReturn(true);
        $proposalForm->getStep()->willReturn($collectStep);
        $this->setProposalForm($proposalForm);
        $this->setProposalDecisionMaker(null);
        $this->setSupervisor(null);
        $this->setAuthor($author);
        $this->viewerCanSee(null)->shouldReturn(false);
    }

    public function it_can_be_seen_by_author_if_step_is_private(
        User $author,
        ProposalForm $proposalForm,
        CollectStep $collectStep
    ): void {
        $author->isAdmin()->willReturn(false);
        $collectStep->isPrivate()->willReturn(true);
        $proposalForm->getStep()->willReturn($collectStep);
        $this->setProposalForm($proposalForm);
        $this->setProposalDecisionMaker(null);
        $this->setSupervisor(null);
        $this->setAuthor($author);
        $this->viewerCanSee($author)->shouldReturn(true);
    }

    public function it_can_be_seen_by_analyst_if_step_is_private(
        User $analyst,
        ProposalAnalyst $proposalAnalyst,
        ProposalForm $proposalForm,
        CollectStep $collectStep
    ): void {
        $analyst->isAdmin()->willReturn(false);
        $collectStep->isPrivate()->willReturn(true);
        $proposalForm->getStep()->willReturn($collectStep);
        $this->setProposalForm($proposalForm);
        $this->setProposalDecisionMaker(null);
        $this->setSupervisor(null);

        $proposalAnalyst->setProposal($this);
        $proposalAnalyst->setAnalyst($analyst);
        $proposalAnalyst->getProposal()->willReturn($this);
        $proposalAnalyst->getAnalyst()->willReturn($analyst);
        $this->addProposalAnalyst($proposalAnalyst);
        $this->getProposalAnalystsArray()->shouldReturn([$proposalAnalyst]);

        $this->viewerCanSee($analyst)->shouldReturn(true);
    }

    public function it_can_be_seen_by_admin_if_step_is_private(
        User $author,
        ProposalForm $proposalForm,
        CollectStep $collectStep
    ): void {
        $author->isAdmin()->willReturn(true);
        $collectStep->isPrivate()->willReturn(true);
        $proposalForm->getStep()->willReturn($collectStep);
        $this->setProposalForm($proposalForm);
        $this->setProposalDecisionMaker(null);
        $this->setSupervisor(null);
        $this->setAuthor($author);
        $this->viewerCanSee($author)->shouldReturn(true);
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

    public function it_is_allowed_author_to_add_news_in_collect_step(
        Project $project,
        ProposalForm $proposalForm,
        ProjectAbstractStep $projectAbstractStep,
        CollectStep $collectStep
    ) {
        $collectStep->isAllowAuthorsToAddNews()->willReturn(true);
        $collectStep->getProject()->willReturn($project);
        $collectStep->isOpen()->willReturn(true);
        $proposalForm->getStep()->willReturn($collectStep);

        $this->setProposalForm($proposalForm);
        $projectAbstractStep->getStep()->willReturn($collectStep);
        $this->setProposalForm($proposalForm);

        $project->addStep($projectAbstractStep)->willReturn($project);
        $pasList = new ArrayCollection([$projectAbstractStep->getWrappedObject()]);

        $project->getSteps()->willReturn($pasList);
        $this->getProject()->shouldReturn($project);
        $this->getSelectionSteps()->shouldReturn([]);
        $this->isProposalAuthorAllowedToAddNews()->shouldReturn(true);

        $collectStep->isAllowAuthorsToAddNews()->willReturn(false);
        $this->isProposalAuthorAllowedToAddNews()->shouldReturn(false);
    }

    public function it_is_allowed_author_to_add_news_in_selection_step(
        Project $project,
        ProposalForm $proposalForm,
        ProjectAbstractStep $projectAbstractStep,
        ProjectAbstractStep $pasSelection1,
        ProjectAbstractStep $pasSelection2,
        CollectStep $collectStep,
        SelectionStep $selectionStep,
        Selection $selection,
        Selection $selection2,
        SelectionStep $selectionStep2
    ) {
        $project->addStep($projectAbstractStep);
        $project->addStep($pasSelection1);
        $collectStep->isAllowAuthorsToAddNews()->willReturn(true);
        $collectStep->getProject()->willReturn($project);
        $collectStep->isOpen()->willReturn(false);
        $proposalForm->getStep()->willReturn($collectStep);

        $this->setProposalForm($proposalForm);
        $projectAbstractStep->getStep()->willReturn($collectStep);
        $this->setProposalForm($proposalForm);

        $project->addStep($projectAbstractStep)->willReturn($project);
        $project->addStep($pasSelection1)->willReturn($project);
        $project->addStep($pasSelection2)->willReturn($project);
        $pasList = new ArrayCollection([
            $projectAbstractStep->getWrappedObject(),
            $pasSelection1->getWrappedObject(),
            $pasSelection2->getWrappedObject(),
        ]);

        $project->getSteps()->willReturn($pasList);
        $this->getProject()->shouldReturn($project);

        $selectionStep->isAllowAuthorsToAddNews()->willReturn(true);
        $selectionStep->isOpen()->willReturn(true);
        $pasSelection1->getStep()->willReturn($selectionStep);
        $pasSelection2->getStep()->willReturn($selectionStep2);
        $selectionStep2->isAllowAuthorsToAddNews()->willReturn(false);
        $selectionStep2->isOpen()->willReturn(true);

        $selection->setProposal($this)->willReturn($selection);
        $selection->getProposal()->willReturn($this);
        $selection->getSelectionStep()->willReturn($selectionStep);

        $this->addSelection($selection);
        $this->getSelectionSteps()->shouldReturn([$selectionStep]);
        $this->isProposalAuthorAllowedToAddNews()->shouldReturn(true);

        $this->removeSelection($selection);
        $this->isProposalAuthorAllowedToAddNews()->shouldReturn(false);

        $selection2->getSelectionStep()->willReturn($selectionStep2);
        $selection2->setProposal($this)->willReturn($selection2);
        $selection2->getProposal()->willReturn($this);

        $this->addSelection($selection2);
        $this->isProposalAuthorAllowedToAddNews()->shouldReturn(false);

        $selectionStep2->isAllowAuthorsToAddNews()->willReturn(true);
        $this->isProposalAuthorAllowedToAddNews()->shouldReturn(true);

        $selectionStep2->isOpen()->willReturn(false);
        $this->isProposalAuthorAllowedToAddNews()->shouldReturn(false);

        $this->addSelection($selection);
        $this->isProposalAuthorAllowedToAddNews()->shouldReturn(true);
    }
}
