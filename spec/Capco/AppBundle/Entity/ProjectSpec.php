<?php

namespace spec\Capco\AppBundle\Entity;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;

class ProjectSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Entity\Project');
    }

    public function it_should_throw_error_when_setting_empty_authors()
    {
        $this->shouldThrow(
            new \InvalidArgumentException('Authors array can not be empty.')
        )->during('setAuthors', [[]]);
    }

    public function it_doesnt_display_votes_counter_when_no_consultations()
    {
        $this->isVotesCounterDisplayable()->shouldReturn(false);
    }

    public function it_doesnt_display_participants_counter_when_no_consultations()
    {
        $this->isParticipantsCounterDisplayable()->shouldReturn(false);
    }

    public function it_doesnt_display_contributions_counter_when_no_consultations()
    {
        $this->isContributionsCounterDisplayable()->shouldReturn(false);
    }

    public function it_display_contributions_counter_when_consultations(
        ConsultationStep $consultationStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($consultationStep);
        $abs->setProject($this)->willReturn($abs);
        $this->addStep($abs);
        $this->isContributionsCounterDisplayable()->shouldReturn(true);
    }

    public function it_display_participants_counter_when_collect(
        CollectStep $collectStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($collectStep);
        $abs->setProject($this)->willReturn($abs);
        $this->addStep($abs);
        $this->isContributionsCounterDisplayable()->shouldReturn(true);
    }

    public function it_display_contributions_counter_when_questionnaire(
        QuestionnaireStep $questionnaireStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($questionnaireStep);
        $abs->setProject($this)->willReturn($abs);
        $this->addStep($abs);
        $this->isContributionsCounterDisplayable()->shouldReturn(true);
    }

    public function it_display_participants_counter_when_consultations(
        ConsultationStep $consultationStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($consultationStep);
        $abs->setProject($this)->willReturn($abs);
        $this->addStep($abs);
        $this->isParticipantsCounterDisplayable()->shouldReturn(true);
    }

    public function it_display_participants_counter_when_questionnaire(
        QuestionnaireStep $questionnaireStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($questionnaireStep);
        $abs->setProject($this)->willReturn($abs);
        $this->addStep($abs);
        $this->isParticipantsCounterDisplayable()->shouldReturn(true);
    }

    public function it_display_contributions_counter_when_collect(
        CollectStep $collectStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($collectStep);
        $abs->setProject($this)->willReturn($abs);
        $this->addStep($abs);
        $this->isParticipantsCounterDisplayable()->shouldReturn(true);
    }

    public function it_display_votes_counter_when_one_consultation_votable(
        QuestionnaireStep $questionnaireStep,
        ConsultationStep $consultationStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($questionnaireStep);
        $abs->setProject($this)->willReturn($abs);
        $consultationStep->isVotable()->willReturn(false);
        $this->addStep($abs);
        $abs->getStep()->willReturn($consultationStep);
        $abs->setProject($this)->willReturn($abs);
        $consultationStep->isVotable()->willReturn(true);
        $this->addStep($abs);
        $this->isVotesCounterDisplayable()->shouldReturn(true);
    }

    public function it_display_votes_counter_when_consultations_votable(
        ConsultationStep $consultationStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($consultationStep);
        $abs->setProject($this)->willReturn($abs);
        $consultationStep->isVotable()->willReturn(true);
        $this->addStep($abs);
        $this->isVotesCounterDisplayable()->shouldReturn(true);
    }

    public function it_display_votes_counter_when_collect_votable(
        CollectStep $collectStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($collectStep);
        $abs->setProject($this)->willReturn($abs);
        $collectStep->isVotable()->willReturn(true);
        $this->addStep($abs);
        $this->isVotesCounterDisplayable()->shouldReturn(true);
    }

    public function it_display_not_votes_counter_when_collect_not_votable(
        ConsultationStep $consultationStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($consultationStep);
        $abs->setProject($this)->willReturn($abs);
        $consultationStep->isVotable()->willReturn(true);
        $this->addStep($abs);
        $this->isVotesCounterDisplayable()->shouldReturn(true);
    }

    public function it_not_display_votes_counter_when_consultations_not_votable(
        ConsultationStep $consultationStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($consultationStep);
        $abs->setProject($this)->willReturn($abs);
        $consultationStep->isVotable()->willReturn(false);
        $this->addStep($abs);
        $this->isVotesCounterDisplayable()->shouldReturn(false);
    }

    public function it_not_display_participants_counter_when_selections_not_votable(
        SelectionStep $selectionStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($selectionStep);
        $abs->setProject($this)->willReturn($abs);
        $selectionStep->isVotable()->willReturn(false);
        $this->addStep($abs);
        $this->isParticipantsCounterDisplayable()->shouldReturn(false);
    }

    public function it_display_participants_counter_when_selections_votable(
        SelectionStep $selectionStep,
        ProjectAbstractStep $abs
    ) {
        $abs->getStep()->willReturn($selectionStep);
        $abs->setProject($this)->willReturn($abs);
        $selectionStep->isVotable()->willReturn(true);
        $this->addStep($abs);
        $this->isParticipantsCounterDisplayable()->shouldReturn(true);
    }
}
