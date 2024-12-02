<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ViewConfiguration;
use Capco\AppBundle\Form\Step\CollectStepFormType;
use Capco\AppBundle\Form\Step\ConsultationStepFormType;
use Capco\AppBundle\Form\Step\DebateStepFormType;
use Capco\AppBundle\Form\Step\OtherStepFormType;
use Capco\AppBundle\Form\Step\PresentationStepFormType;
use Capco\AppBundle\Form\Step\QuestionnaireStepFormType;
use Capco\AppBundle\Form\Step\RankingStepFormType;
use Capco\AppBundle\Form\Step\SelectionStepFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProjectAbstractStepRepository;
use Capco\AppBundle\Utils\Diff;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class ProjectStepPersister
{
    // A list of step that implements the Global ID, needed by the method `normalize` to correctly determine
    // if we should find the entity in DB by the $step['id'] directly or if we should decode it first.
    // At this point, because it is before the form submission, I can not benefit from the `RelayGlobalIdType`,
    // so I have to explicitly define here what steps implement the global id pattern
    private const GLOBAL_ID_STEP_TYPES = [
        ConsultationStep::TYPE,
        CollectStep::TYPE,
        SelectionStep::TYPE,
        DebateStep::TYPE,
    ];

    public function __construct(private readonly LoggerInterface $logger, private readonly EntityManagerInterface $em, private readonly AbstractStepRepository $repository, private readonly ProjectAbstractStepRepository $pasRepository, private readonly FormFactoryInterface $formFactory, private readonly GlobalIdResolver $globalIdResolver)
    {
    }

    public function persist(Project $project, array $steps, User $viewer): void
    {
        $steps = $this->normalize($steps);
        $dbSteps = new ArrayCollection($project->getRealSteps());
        $userSteps = new ArrayCollection($steps);
        foreach ($userSteps as $i => $step) {
            list($type, $entity) = $this->getFormEntity($step);
            $form = $this->formFactory->create($type, $entity);
            if ('questionnaire' === $step['type']) {
                $this->removeStepInPreviousQuestionnaire($step, $dbSteps);
            }
            if ('collect' === $step['type']) {
                $this->removeAnalysisConfigurationInPreviousCollectStep($step, $dbSteps);
            }
            unset($step['id']);
            if ('collect' === $step['type'] || 'selection' === $step['type']) {
                self::setDefaultMainViewIfNeeded($step, $project);
            } else {
                unset($step['votesMin'], $step['allowAuthorsToAddNews']);
            }

            $consultations = $this->getConsultationsFromInput($step, $viewer);

            $form->submit($step);
            if (!$form->isValid()) {
                $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

                throw GraphQLException::fromFormErrors($form);
            }
            /** @var AbstractStep $stepFromData */
            $stepFromData = $form->getData();
            if ($stepFromData instanceof ConsultationStep) {
                $this->updateConsultations($consultations, $stepFromData);
            }

            $this->setProjectAbstractStepToProject($project, $stepFromData, $i);

            $this->setStatusPosition($stepFromData);
        }

        $this->processToDeleteSteps($dbSteps, $userSteps, $project);

        $this->em->flush();
    }

    private function processToDeleteSteps(
        Collection $dbSteps,
        Collection $userSteps,
        Project $project
    ) {
        $stepsToDelete = Diff::fromCollectionsWithId($dbSteps, $userSteps);
        foreach ($stepsToDelete as $stepToDelete) {
            $projectAbstractStep = $this->pasRepository->findOneBy(['step' => $stepToDelete]);
            if ($projectAbstractStep) {
                $project->removeStep($projectAbstractStep);
            }
        }
    }

    private function setProjectAbstractStepToProject(
        Project $project,
        AbstractStep $stepFromData,
        int $loopCount
    ): void {
        $pasMatch = $this->pasRepository->findOneBy([
            'project' => $project,
            'step' => $stepFromData,
        ]);
        if (!$pasMatch) {
            $pas = new ProjectAbstractStep();
            $pas->setPosition($loopCount + 1)
                ->setProject($project)
                ->setStep($stepFromData)
            ;
            $project->addStep($pas);
            $stepFromData->setProjectAbstractStep($pas);
        } else {
            $pasMatch->setPosition($loopCount + 1);
        }
    }

    private function setStatusPosition(AbstractStep $stepFromData): void
    {
        foreach ($stepFromData->getStatuses() as $pos => $status) {
            if (null === $status->getPosition()) {
                $status->setPosition($pos);
            }
        }
    }

    /**
     * Normalize user input to map IDs of the step. When submitted, some steps are Relay Global IDs, somes are not.
     * This method return a normalized $steps array with all 'id' values correctly decoded when necessary.
     *
     * @param array $steps The user input
     *
     * @return array The normalized data with correct IDs
     */
    private function normalize(array $steps): array
    {
        return array_map(static function (array $step) {
            $overrides = [];
            if (!empty($step['id'])) {
                // The step we are trying to add/update is a global id, so we must decode it before fetching it to the db
                $id = \in_array($step['type'], self::GLOBAL_ID_STEP_TYPES, true)
                    ? GlobalId::fromGlobalId($step['id'])['id']
                    : $step['id'];
                $overrides = compact('id');
            }

            return array_merge($step, $overrides);
        }, $steps);
    }

    /**
     * Given a step, returns it's corresponding form class and correct entity based on it's type.
     *
     * @param array $step The user input
     *
     * @return array A tuple containing [the form class name, the corresponding entity] based on the step type
     */
    private function getFormEntity(array $step): array
    {
        $formTypeConfig = [
            OtherStep::TYPE => [OtherStepFormType::class, new OtherStep()],
            PresentationStep::TYPE => [PresentationStepFormType::class, new PresentationStep()],
            RankingStep::TYPE => [RankingStepFormType::class, new RankingStep()],
            ConsultationStep::TYPE => [ConsultationStepFormType::class, new ConsultationStep()],
            SelectionStep::TYPE => [SelectionStepFormType::class, new SelectionStep()],
            CollectStep::TYPE => [CollectStepFormType::class, new CollectStep()],
            QuestionnaireStep::TYPE => [QuestionnaireStepFormType::class, new QuestionnaireStep()],
            DebateStep::TYPE => [DebateStepFormType::class, new DebateStep(new Debate())],
        ];
        if (isset($formTypeConfig[$step['type']])) {
            $return = $formTypeConfig[$step['type']];
        } else {
            throw new \LogicException(sprintf('Unknown step type given: "%s"', $step['type']));
        }

        if (self::isEditMode($step)) {
            $entity = $this->repository->find($step['id']);
            if (null === $entity) {
                throw new UserError('Unknown step ' . $step['id'] . '.');
            }
            $return[1] = $entity;
        }

        return $return;
    }

    private static function isEditMode(array $stepData): bool
    {
        return isset($stepData['id']) && null !== $stepData['id'] && '' !== $stepData['id'];
    }

    private static function setDefaultMainViewIfNeeded(array &$stepData, Project $project): void
    {
        if (!isset($stepData['mainView'])) {
            $stepData['mainView'] = $project->getFirstCollectStep()
                ? $project->getFirstCollectStep()->getMainView()
                : ViewConfiguration::GRID;
        }
    }

    private function getConsultationsFromInput(array &$input, User $viewer): array
    {
        $consultations = [];
        if ('consultation' === $input['type'] && isset($input['consultations'])) {
            foreach ($input['consultations'] as $consultationId) {
                $consultations[] = $this->globalIdResolver->resolve($consultationId, $viewer);
            }
            unset($input['consultations']);
        }

        return $consultations;
    }

    private function updateConsultations(array $consultations, ConsultationStep $step): void
    {
        $oldConsultations = $step->getConsultations()->toArray();
        $step->getConsultations()->clear();
        $position = 1;
        foreach ($consultations as $consultation) {
            $consultation->setPosition($position);
            $step->addConsultation($consultation);
            ++$position;
        }

        foreach ($oldConsultations as $oldConsultation) {
            if (!$step->getConsultations()->contains($oldConsultation)) {
                $oldConsultation->clearStep();
            }
        }
    }

    private function removeStepInPreviousQuestionnaire(
        array $parsedStep,
        ArrayCollection $dbSteps
    ): void {
        $currentStep = null;
        foreach ($dbSteps as $dbStep) {
            if ($dbStep->getId() === $parsedStep['id']) {
                $currentStep = $dbStep;

                break;
            }
        }

        if (!$currentStep) {
            return;
        }

        $parsedQuestionnaire = GlobalIdResolver::getDecodedId($parsedStep['questionnaire']);
        $questionnaire = $currentStep->getQuestionnaire();
        $isSameQuestionnaire = $questionnaire->getId() === $parsedQuestionnaire['id'];

        if ($isSameQuestionnaire) {
            return;
        }

        $questionnaire->setStep(null);
        $this->em->flush();
    }

    /**
     * Remove the analysis configuration in the previous collect step if the new proposal form is different.
     *
     * @param array<string, string>              $step    The user input
     * @param ArrayCollection<int, AbstractStep> $dbSteps The steps in the database
     */
    private function removeAnalysisConfigurationInPreviousCollectStep(array $step, ArrayCollection $dbSteps): void
    {
        // Find the current collect step in the user input
        $currentCollectStep = null;
        foreach ($dbSteps as $dbStep) {
            if (isset($step['id']) && $dbStep->getId() === $step['id'] && $dbStep instanceof CollectStep) {
                $currentCollectStep = $dbStep;

                break;
            }
        }

        // If there's no current collect step or it doesn't have an associated analysis configuration, do nothing
        if (!$currentCollectStep || !$currentCollectStep->getProposalForm() || !$currentCollectStep->getProposalForm()->getAnalysisConfiguration()) {
            return;
        }

        // Remove the analysis configuration for the previous proposal form only if the new proposal form is different
        if (isset($step['proposalForm']) && $step['proposalForm'] === $currentCollectStep->getProposalForm()->getId()) {
            return;
        }

        $this->em->remove($currentCollectStep->getProposalForm()->getAnalysisConfiguration());
        $this->em->flush();
    }
}
