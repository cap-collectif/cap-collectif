<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\QuestionnaireType;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Security\ProposalFormVoter;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ConfigureAnalysisMutation implements MutationInterface
{
    use MutationTrait;
    use ResolverTrait;

    private $analysisConfigurationRepository;
    private $proposalFormRepository;
    private $questionnaireRepository;
    private $abstractStepRepository;
    private $statusRepository;
    private $selectionStepRepository;
    private $entityManager;
    private readonly LoggerInterface $logger;
    private readonly AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        ProposalFormRepository $proposalFormRepository,
        QuestionnaireRepository $questionnaireRepository,
        AbstractStepRepository $abstractStepRepository,
        StatusRepository $statusRepository,
        SelectionStepRepository $selectionStepRepository,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->proposalFormRepository = $proposalFormRepository;
        $this->questionnaireRepository = $questionnaireRepository;
        $this->abstractStepRepository = $abstractStepRepository;
        $this->statusRepository = $statusRepository;
        $this->selectionStepRepository = $selectionStepRepository;
        $this->entityManager = $entityManager;
        $this->logger = $logger;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $args, $viewer): array
    {
        $this->formatInput($args);
        $this->preventNullableViewer($viewer);

        list(
            $proposalFormId,
            $evaluationFormId,
            $analysisStepId,
            $effectiveDate,
            $favourableStatusId,
            $unfavourableStatusesIds,
            $moveToSelectionStepId,
            $selectionStepStatusId,
            $costEstimationEnabled,
            $body,
            $bodyUsingJoditWysiwyg) = [
                $args->offsetGet('proposalFormId'),
                $args->offsetGet('evaluationFormId'),
                $args->offsetGet('analysisStepId'),
                $args->offsetGet('effectiveDate'),
                $args->offsetGet('favourableStatus'),
                $args->offsetGet('unfavourableStatuses'),
                $args->offsetGet('moveToSelectionStepId'),
                $args->offsetGet('selectionStepStatusId'),
                $args->offsetGet('costEstimationEnabled'),
                $args->offsetGet('body'),
                $args->offsetGet('bodyUsingJoditWysiwyg'),
            ];

        $evaluationForm = null;
        $favourableStatus = null;
        $chosenSelectionStepStatus = null;
        $unfavourablesStatuses = [];
        $moveToSelectionStep = null;

        $proposalForm = $this->getProposalForm($proposalFormId);

        if (
            !($analysisStep = $this->abstractStepRepository->find(
                GlobalId::fromGlobalId($analysisStepId)['id']
            ))
            && !($analysisStep instanceof CollectStep || $analysisStep instanceof SelectionStep)
        ) {
            throw new UserError('The analysis step is not an instance of a CollectStep or a SelectionStep.');
        }

        if (!($analysisConfiguration = $proposalForm->getAnalysisConfiguration())) {
            $analysisConfiguration = new AnalysisConfiguration();
        }

        if ($favourableStatusId) {
            /** @var Status $favourableStatus */
            $favourableStatus = $this->statusRepository->find($favourableStatusId);
        }

        if (!empty($unfavourableStatusesIds)) {
            $unfavourablesStatuses = $this->statusRepository->findBy([
                'id' => $unfavourableStatusesIds,
            ]);
        }

        /** @var Questionnaire $evaluationForm */
        if (
            $evaluationFormId
            && !($evaluationForm = $this->questionnaireRepository->find(
                GlobalId::fromGlobalId($evaluationFormId)['id']
            ))
        ) {
            throw new UserError('This evaluation form does not exist.');
        }

        if ($moveToSelectionStepId) {
            /** @var SelectionStep $moveToSelectionStep */
            $moveToSelectionStep = $this->selectionStepRepository->find(
                GlobalId::fromGlobalId($moveToSelectionStepId)['id']
            );

            if ($selectionStepStatusId && $moveToSelectionStep) {
                $selectionStepStatuses = $moveToSelectionStep->getStatuses();
                /** @var Status $selectionStepStatus */
                foreach ($selectionStepStatuses as $selectionStepStatus) {
                    if ($selectionStepStatus->getId() === $selectionStepStatusId) {
                        $chosenSelectionStepStatus = $selectionStepStatus;
                    }
                }
            }
        }

        $this->handleEvaluationFormType($analysisConfiguration, $evaluationForm);

        $analysisConfiguration
            ->setProposalForm($proposalForm)
            ->setEvaluationForm($evaluationForm)
            ->setAnalysisStep($analysisStep)
            ->setEffectiveDateAndProcessed($effectiveDate ? new \DateTime($effectiveDate) : null)
            ->setFavourableStatus($favourableStatus)
            ->setUnfavourablesStatuses($unfavourablesStatuses)
            ->setMoveToSelectionStep($moveToSelectionStep)
            ->setSelectionStepStatus($chosenSelectionStepStatus)
            ->setCostEstimationEnabled($costEstimationEnabled)
            ->setBody($body ?? '')
            ->setBodyUsingJoditWysiwyg($bodyUsingJoditWysiwyg ?? false)
        ;

        try {
            $this->entityManager->persist($analysisConfiguration);
            $this->entityManager->flush();
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $exception->getMessage());

            throw $exception;
        }

        return compact('analysisConfiguration');
    }

    public function isGranted(string $proposalFormId): bool
    {
        $proposalForm = $this->getProposalForm($proposalFormId);

        return $this->authorizationChecker->isGranted(ProposalFormVoter::EDIT, $proposalForm);
    }

    private function getProposalForm(string $proposalFormId): ProposalForm
    {
        $proposalForm = $this->proposalFormRepository->find($proposalFormId);
        if (!$proposalForm) {
            throw new UserError('This proposalForm does not exist.');
        }

        return $proposalForm;
    }

    private function handleEvaluationFormType(AnalysisConfiguration $analysisConfiguration, ?Questionnaire $newEvaluationForm): void
    {
        $currentEvaluationForm = $analysisConfiguration->getEvaluationForm();

        if ($currentEvaluationForm) {
            $currentEvaluationForm->setType(QuestionnaireType::QUESTIONNAIRE);
        }

        if ($newEvaluationForm) {
            $newEvaluationForm->setType(QuestionnaireType::QUESTIONNAIRE_ANALYSIS);
        }
    }
}
