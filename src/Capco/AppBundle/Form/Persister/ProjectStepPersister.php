<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use GraphQL\Error\UserError;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Utils\Diff;
use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Form\Step\OtherStepFormType;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\Form\Step\DebateStepFormType;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Form\Step\CollectStepFormType;
use Capco\AppBundle\Form\Step\RankingStepFormType;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Form\Step\SelectionStepFormType;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Form\Step\ConsultationStepFormType;
use Capco\AppBundle\Form\Step\PresentationStepFormType;
use Capco\AppBundle\Form\Step\QuestionnaireStepFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\ProjectAbstractStepRepository;

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

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private LoggerInterface $logger;
    private AbstractStepRepository $repository;
    private ProjectAbstractStepRepository $pasRepository;

    public function __construct(
        LoggerInterface $logger,
        EntityManagerInterface $em,
        AbstractStepRepository $repository,
        ProjectAbstractStepRepository $pasRepository,
        FormFactoryInterface $formFactory
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->repository = $repository;
        $this->pasRepository = $pasRepository;
    }

    public function persist(Project $project, array $steps): void
    {
        $steps = $this->normalize($steps);
        $dbSteps = new ArrayCollection($project->getRealSteps());
        $userSteps = new ArrayCollection($steps);
        foreach ($userSteps as $i => $step) {
            list($type, $entity) = $this->getFormEntity($step);
            $form = $this->formFactory->create($type, $entity);
            unset($step['id']);
            if (!$entity instanceof CollectStep && !$entity instanceof SelectionStep) {
                unset($step['votesMin']);
                if (isset($step['allowAuthorsToAddNews'])) {
                    unset($step['allowAuthorsToAddNews']);
                }
            }
            if (
                'collect' === $step['type'] ||
                ('selection' === $step['type'] && !isset($step['mainView']))
            ) {
                $step['mainView'] = $project->getFirstCollectStep()
                    ? $project->getFirstCollectStep()->getMainView()
                    : 'grid';
            }
            $form->submit($step);
            if (!$form->isValid()) {
                $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

                throw GraphQLException::fromFormErrors($form);
            }
            /** @var AbstractStep $stepFromData */
            $stepFromData = $form->getData();
            $pasMatch = $this->pasRepository->findOneBy([
                'project' => $project,
                'step' => $stepFromData,
            ]);
            if (!$pasMatch) {
                $pas = new ProjectAbstractStep();
                $pas->setPosition($i + 1)
                    ->setProject($project)
                    ->setStep($stepFromData);
                $project->addStep($pas);
            } else {
                $pasMatch->setPosition($i + 1);
            }

            foreach ($stepFromData->getStatuses() as $pos => $status) {
                if (null === $status->getPosition()) {
                    $status->setPosition($pos);
                }
            }
        }
        $stepsToDelete = Diff::fromCollectionsWithId($dbSteps, $userSteps);
        foreach ($stepsToDelete as $stepToDelete) {
            $projectAbstractStep = $this->pasRepository->findOneBy(['step' => $stepToDelete]);
            if ($projectAbstractStep) {
                $project->removeStep($projectAbstractStep);
            }
        }
        $this->em->flush();
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
        switch ($step['type']) {
            case OtherStep::TYPE:
                $return = [OtherStepFormType::class, new OtherStep()];

                break;
            case PresentationStep::TYPE:
                $return = [PresentationStepFormType::class, new PresentationStep()];

                break;
            case RankingStep::TYPE:
                $return = [RankingStepFormType::class, new RankingStep()];

                break;
            case ConsultationStep::TYPE:
                $return = [ConsultationStepFormType::class, new ConsultationStep()];

                break;
            case SelectionStep::TYPE:
                $return = [SelectionStepFormType::class, new SelectionStep()];

                break;
            case CollectStep::TYPE:
                $return = [CollectStepFormType::class, new CollectStep()];

                break;
            case QuestionnaireStep::TYPE:
                $return = [QuestionnaireStepFormType::class, new QuestionnaireStep()];

                break;
            case DebateStep::TYPE:
                $return = [DebateStepFormType::class, new DebateStep(new Debate())];

                break;
            default:
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
}
