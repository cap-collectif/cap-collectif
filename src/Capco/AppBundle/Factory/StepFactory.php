<?php

declare(strict_types=1);

namespace Capco\AppBundle\Factory;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\DebateType;
use Capco\AppBundle\Enum\StatusColor;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Contracts\Translation\TranslatorInterface;

class StepFactory
{
    private TranslatorInterface $translator;
    private string $locale;

    public function __construct(TranslatorInterface $translator, string $locale)
    {
        $this->translator = $translator;
        $this->locale = $locale;
    }

    public function createCollectStep(): CollectStep
    {
        return (new CollectStep())
            ->setLabel($this->trans('step.collect.default.title'))
            ->setTitle($this->trans('step.collect.default.title'))
            ->setBody($this->trans('submit.your.proposal'))
            ->setStartAt(new \DateTime('today midnight'))
            ->setEndAt((new \DateTime('today 23:59:00'))->add(new \DateInterval('P1M')))
        ;
    }

    public function createConsultationStep(): ConsultationStep
    {
        $problemsOpinionType = (new OpinionType())
            ->setPosition(1)
            ->setIsEnabled(false)
            ->setSourceable(false)
            ->setVersionable(false)
            ->setTitle($this->trans('opinion_type.problems'))
            ->setColor(array_values(OpinionType::$colorsType)[0])
            ->setDefaultFilter('positions')
        ;

        $solutionOpinionType = (new OpinionType())
            ->setPosition(2)
            ->setIsEnabled(true)
            ->setSourceable(false)
            ->setVersionable(false)
            ->setTitle($this->trans('opinion_type.solutions'))
            ->setColor(array_values(OpinionType::$colorsType)[1])
            ->setDefaultFilter('positions')
        ;

        $consultation = (new Consultation())
            ->setTitle($this->trans('consultation.default.title'))
            ->addOpinionType($problemsOpinionType)
            ->addOpinionType($solutionOpinionType)
        ;

        return (new ConsultationStep())
            ->setLabel($this->trans('step.types.consultation'))
            ->setTitle($this->trans('step.consultation.default.title'))
            ->setBody($this->trans('step.consultation.default.description'))
            ->setStartAt(new \DateTime('today midnight'))
            ->setEndAt((new \DateTime('today 23:59:00'))->add(new \DateInterval('P3M')))
            ->setTimeless(false)
            ->addConsultation($consultation)
        ;
    }

    public function createDebateStep(): DebateStep
    {
        $debate = (new Debate());

        return (new DebateStep($debate))
            ->setLabel($this->trans('step.types.debate'))
            ->setTitle($this->trans('step.debate.default.title'))
            ->setDebateType(DebateType::WYSIWYG)
            ->setIsEnabled(true)
            ->setTimeless(true)
            ->setIsAnonymousParticipationAllowed(true)
        ;
    }

    public function createOtherStep(): OtherStep
    {
        return (new OtherStep())
            ->setTitle('')
        ;
    }

    public function createQuestionnaireStep(): QuestionnaireStep
    {
        $question = (new SimpleQuestion())
            ->setTitle($this->trans('question.default.title'))
            ->setType(SimpleQuestion::QUESTION_TYPE_MULTILINE_TEXT)
        ;

        $qaq = (new QuestionnaireAbstractQuestion())
            ->setQuestion($question)
            ->setPosition(1)
        ;

        $questionnaire = (new Questionnaire())
            ->setTitle($this->trans('questionnaire.default.title'))
            ->setDescription($this->trans('questionnaire.default.description'))
            ->addQuestion($qaq)
        ;

        return (new QuestionnaireStep())
            ->setLabel($this->trans('step.types.questionnaire'))
            ->setTitle($this->trans('step.questionnaire.default.title'))
            ->setBody($this->trans('step.questionnaire.default.description'))
            ->setIsAnonymousParticipationAllowed(true)
            ->setIsEnabled(true)
            ->setCollectParticipantsEmail(true)
            ->setStartAt(new \DateTime('today midnight'))
            ->setEndAt((new \DateTime('today 23:59:00'))->add(new \DateInterval('P1M')))
            ->setQuestionnaire($questionnaire)
        ;
    }

    public function createVoteAndSelectionStep(): SelectionStep
    {
        return (new SelectionStep())
            ->setTitle($this->trans('step.vote_and_selection.default.title'))
            ->setLabel($this->trans('step.vote_and_selection.default.label'))
            ->setBody($this->trans('step.vote_and_selection.default.description'))
            ->setStartAt(new \DateTime('today midnight'))
            ->setEndAt((new \DateTime('today 23:59:00'))->add(new \DateInterval('P1M')))
            ->setStatuses(new ArrayCollection([
                $this->createStatus('put-to-the-vote', StatusColor::INFO, 1),
            ]))
            ->setAllowAuthorsToAddNews(true)
            ->setDefaultSort('random')
            ->setVoteType(1)
            ->setVotesLimit(3)
        ;
    }

    public function createAnalysisStep(): SelectionStep
    {
        $defaultStatus = $this->createStatus('under-analysis', StatusColor::WARNING, 1);

        return (new SelectionStep())
            ->setTitle($this->trans('step.analysis.default.title'))
            ->setLabel($this->trans('step.analysis.default.label'))
            ->setBody($this->trans('step.analysis.default.description'))
            ->setStartAt(new \DateTime('today midnight'))
            ->setEndAt((new \DateTime('today 23:59:00'))->add(new \DateInterval('P3M')))
            ->setStatuses(new ArrayCollection([
                $defaultStatus,
                $this->createStatus('put-to-the-vote', StatusColor::SUCCESS, 2),
                $this->createStatus('not-achievable', StatusColor::DANGER, 3),
                $this->createStatus('out-of-scope', StatusColor::DANGER, 4),
                $this->createStatus('already-planned', StatusColor::DANGER, 5),
                $this->createStatus('merged', StatusColor::INFO, 6),
            ]))
            ->setDefaultStatus($defaultStatus)
            ->setAllowAuthorsToAddNews(false)
            ->setDefaultSort('random')
            ->setVoteType(0)
        ;
    }

    public function createResultStep(): SelectionStep
    {
        return (new SelectionStep())
            ->setTitle($this->trans('step.result.default.title'))
            ->setLabel($this->trans('step.result.default.label'))
            ->setBody($this->trans('step.result.default.description'))
            ->setStartAt(new \DateTime('today midnight'))
            ->setEndAt((new \DateTime('today 23:59:00'))->add(new \DateInterval('P1M')))
            ->setStatuses(new ArrayCollection([
                $this->createStatus('completed-project', StatusColor::SUCCESS, 1),
                // Censé être du orange ici pour ce status mais l'enum se base sur des nom de class bootstrap
                $this->createStatus('project-in-progress', StatusColor::WARNING, 2),
                $this->createStatus('project-under-study', StatusColor::WARNING, 3),
                $this->createStatus('award-winning-project', StatusColor::INFO, 4),
            ]))
            ->setAllowAuthorsToAddNews(true)
            ->setAllowingProgressSteps(true)
            ->setDefaultSort('random')
            ->setVoteType(0)
        ;
    }

    public function createSelectionStep(): SelectionStep
    {
        return (new SelectionStep())
            ->setTitle('')
        ;
    }

    private function createStatus(string $name, string $color, int $position): Status
    {
        return (new Status())
            ->setName($this->trans($name))
            ->setColor($color)
            ->setPosition($position)
        ;
    }

    private function trans(string $id): string
    {
        return $this->translator->trans($id, [], 'CapcoAppBundle', $this->locale);
    }
}
