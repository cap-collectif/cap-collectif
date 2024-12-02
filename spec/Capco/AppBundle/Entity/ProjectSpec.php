<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use PhpSpec\ObjectBehavior;

class ProjectSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Project::class);
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

    public function it_is_not_localized_by_default()
    {
        $this->getLocale()->shouldReturn(null);
        $this->getLocaleCode()->shouldReturn(null);
        $this->isLocalized()->shouldReturn(false);
        $this->matchLocale(null)->shouldReturn(true);
        $this->matchLocale('fr-FR')->shouldReturn(true);
        $this->matchLocale('en-GB')->shouldReturn(true);
    }

    public function it_can_be_localized(Locale $locale)
    {
        $locale->getCode()->willReturn('fr-FR');
        $this->setLocale($locale);

        $this->getLocale()->shouldReturn($locale);
        $this->getLocaleCode()->shouldReturn('fr-FR');
        $this->isLocalized()->shouldReturn(true);
        $this->matchLocale(null)->shouldReturn(true);
        $this->matchLocale('fr-FR')->shouldReturn(true);
        $this->matchLocale('en-GB')->shouldReturn(false);
    }
}
