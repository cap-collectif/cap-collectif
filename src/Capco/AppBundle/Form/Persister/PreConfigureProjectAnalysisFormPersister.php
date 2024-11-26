<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Mutation\ConfigureAnalysisMutation;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class PreConfigureProjectAnalysisFormPersister
{
    private readonly ConfigureAnalysisMutation $configureAnalysisMutation;
    private readonly AbstractStepRepository $abstractStepRepository;
    private readonly StatusRepository $statusRepository;

    public function __construct(
        ConfigureAnalysisMutation $configureAnalysisMutation,
        AbstractStepRepository $abstractStepRepository,
        StatusRepository $statusRepository
    ) {
        $this->configureAnalysisMutation = $configureAnalysisMutation;
        $this->abstractStepRepository = $abstractStepRepository;
        $this->statusRepository = $statusRepository;
    }

    public function configureAnalysisForm(array $input, User $viewer, Project $project, array $proposalFormTitleToIdMap, array $questionnaireTitleToIdMap)
    {
        if (empty($input)) {
            return;
        }

        $input['proposalFormId'] = $proposalFormTitleToIdMap[$input['proposalFormId']];
        $input['evaluationFormId'] = GlobalId::toGlobalId('Questionnaire', $questionnaireTitleToIdMap[$input['evaluationFormId']]);

        $analysisStep = $this->abstractStepRepository->findOneByProjectAndStepLabel($project, $input['analysisStepId']);
        $input['analysisStepId'] = GlobalId::toGlobalId('SelectionStep', $analysisStep->getId());

        $selectionStep = $this->abstractStepRepository->findOneByProjectAndStepLabel($project, $input['moveToSelectionStepId']);
        $input['moveToSelectionStepId'] = GlobalId::toGlobalId('SelectionStep', $selectionStep->getId());

        $selectionStepStatuses = $this->statusRepository->getByProjectAndStepAndStatusTitle($project, $selectionStep, [$input['selectionStepStatusId']]);
        if ($selectionStepStatuses) {
            $input['selectionStepStatusId'] = $selectionStepStatuses[0]->getId();
        }

        $unfavourableStatus = $this->statusRepository->getByProjectAndStepAndStatusTitle($project, $analysisStep, $input['unfavourableStatuses']);
        $input['unfavourableStatuses'] = array_map(function ($unfavourableStatus) {
            return $unfavourableStatus->getId();
        }, $unfavourableStatus);

        $favourableStatuses = $this->statusRepository->getByProjectAndStepAndStatusTitle($project, $analysisStep, [$input['favourableStatus']]);
        if ($favourableStatuses) {
            $input['favourableStatus'] = $favourableStatuses[0]->getId();
        }

        $this->configureAnalysisMutation->__invoke(new Argument(['input' => $input]), $viewer);
    }
}
