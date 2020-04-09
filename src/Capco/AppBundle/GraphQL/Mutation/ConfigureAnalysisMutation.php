<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class ConfigureAnalysisMutation implements MutationInterface
{
    use ResolverTrait;

    private $analysisConfigurationRepository;
    private $proposalFormRepository;
    private $questionnaireRepository;
    private $abstractStepRepository;
    private $statusRepository;
    private $selectionStepRepository;
    private $entityManager;
    private LoggerInterface $logger;

    public function __construct(
        ProposalFormRepository $proposalFormRepository,
        QuestionnaireRepository $questionnaireRepository,
        AbstractStepRepository $abstractStepRepository,
        StatusRepository $statusRepository,
        SelectionStepRepository $selectionStepRepository,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger
    ) {
        $this->proposalFormRepository = $proposalFormRepository;
        $this->questionnaireRepository = $questionnaireRepository;
        $this->abstractStepRepository = $abstractStepRepository;
        $this->statusRepository = $statusRepository;
        $this->selectionStepRepository = $selectionStepRepository;
        $this->entityManager = $entityManager;
        $this->logger = $logger;
    }

    public function __invoke(Argument $args, $viewer): array
    {
        $this->preventNullableViewer($viewer);

        list(
            $proposalFormId,
            $evaluationFormId,
            $analysisStepId,
            $effectiveDate,
            $favourableStatusId,
            $unfavourableStatusesIds,
            $moveToSelectionStepId,
            $costEstimationEnabled,
            $body
        ) = [
            $args->offsetGet('proposalFormId'),
            $args->offsetGet('evaluationFormId'),
            $args->offsetGet('analysisStepId'),
            $args->offsetGet('effectiveDate'),
            $args->offsetGet('favourableStatus'),
            $args->offsetGet('unfavourableStatuses'),
            $args->offsetGet('moveToSelectionStepId'),
            $args->offsetGet('costEstimationEnabled'),
            $args->offsetGet('body'),
        ];

        $evaluationForm = null;
        $favourableStatus = null;
        $unfavourablesStatuses = [];

        /** @var ProposalForm $proposalForm */
        if (!($proposalForm = $this->proposalFormRepository->find($proposalFormId))) {
            throw new UserError('This proposalForm does not exist.');
        }

        if (
            !($analysisStep = $this->abstractStepRepository->find(
                GlobalId::fromGlobalId($analysisStepId)['id']
            )) &&
            !($analysisStep instanceof CollectStep || $analysisStep instanceof SelectionStep)
        ) {
            throw new UserError(
                'The analysis step is not an instance of a CollectStep or a SelectionStep.'
            );
        }

        /** @var SelectionStep $moveToSelectionStep */
        if (
            !($moveToSelectionStep = $this->selectionStepRepository->find(
                GlobalId::fromGlobalId($moveToSelectionStepId)['id']
            ))
        ) {
            throw new UserError('This selection step does not exist.');
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
            $evaluationFormId &&
            !($evaluationForm = $this->questionnaireRepository->find(
                GlobalId::fromGlobalId($evaluationFormId)['id']
            ))
        ) {
            throw new UserError('This evaluation form does not exist.');
        }

        $analysisConfiguration
            ->setProposalForm($proposalForm)
            ->setEvaluationForm($evaluationForm)
            ->setAnalysisStep($analysisStep)
            ->setEffectiveDate($effectiveDate ? new \DateTime($effectiveDate) : null)
            ->setFavourableStatus($favourableStatus)
            ->setUnfavourablesStatuses($unfavourablesStatuses)
            ->setMoveToSelectionStep($moveToSelectionStep)
            ->setCostEstimationEnabled($costEstimationEnabled)
            ->setBody($body);

        try {
            $this->entityManager->persist($analysisConfiguration);
            $this->entityManager->flush();
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $exception->getMessage());

            throw $exception;
        }

        return compact('analysisConfiguration');
    }
}
