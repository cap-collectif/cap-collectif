<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Mutation\UpdateAlphaProjectMutation;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class PreConfigureProjectProjectPersister
{
    public function __construct(
        private readonly UpdateAlphaProjectMutation $updateAlphaProjectMutation,
        private readonly AbstractStepRepository $abstractStepRepository,
        private readonly StatusRepository $statusRepository,
        private readonly ProposalFormRepository $proposalFormRepository,
        private readonly QuestionnaireRepository $questionnaireRepository,
        private readonly EntityManagerInterface $em
    ) {
    }

    public function updateProject(array $projectInput, User $viewer, Project $project, array $proposalFormTitleToIdMap, array $questionnaireTitleToIdMap): Project
    {
        $projectId = GlobalId::toGlobalId('Project', $project->getId());
        $projectInput['projectId'] = $projectId;

        $stepsWithDefaultStatus = $this->getStepsWithDefaultStatus($projectInput['steps']);
        $stepsWithProposalForm = $this->getStepsWithProposalForm($projectInput['steps']);
        $stepsWithQuestionnaire = $this->getStepsWithQuestionnaire($projectInput['steps']);

        ['project' => $updatedProject] = $this->updateAlphaProjectMutation->__invoke(new Argument(['input' => $projectInput]), $viewer);

        $this->addDefaultStatus($updatedProject, $stepsWithDefaultStatus);
        $this->addProposalFormToProject($updatedProject, $stepsWithProposalForm, $proposalFormTitleToIdMap);
        $this->addQuestionnaireToProject($updatedProject, $stepsWithQuestionnaire, $questionnaireTitleToIdMap);

        return $updatedProject;
    }

    private function getStepsWithDefaultStatus(array &$steps): array
    {
        if (empty($steps)) {
            return [];
        }

        $stepsWithDefaultStatus = [];
        foreach ($steps as &$step) {
            if (($step['defaultStatus'] ?? null) !== null) {
                $stepsWithDefaultStatus[] = [
                    'stepLabel' => $step['label'],
                    'defaultStatus' => $step['defaultStatus'],
                ];
                $step['defaultStatus'] = null;
            }
        }

        return $stepsWithDefaultStatus;
    }

    private function getStepsWithProposalForm(array &$steps): array
    {
        if (empty($steps)) {
            return [];
        }

        $stepsWithProposalForm = [];
        foreach ($steps as &$step) {
            if (($step['proposalForm'] ?? null) !== null) {
                $stepsWithProposalForm[] = [
                    'stepLabel' => $step['label'],
                    'proposalFormTitle' => $step['proposalForm'],
                ];
                $step['proposalForm'] = null;
            }
        }

        return $stepsWithProposalForm;
    }

    private function addDefaultStatus(Project $project, array $stepsWithDefaultStatus)
    {
        if (empty($stepsWithDefaultStatus)) {
            return;
        }

        foreach ($stepsWithDefaultStatus as $stepWithDefaultStatus) {
            $stepLabel = $stepWithDefaultStatus['stepLabel'];
            $statusTitle = $stepWithDefaultStatus['defaultStatus'];
            $step = $this->abstractStepRepository->findOneByProjectAndStepLabel($project, $stepLabel);
            $defaultStatus = $this->statusRepository->getByProjectAndStepAndStatusTitle($project, $step, [$statusTitle]);
            if ($defaultStatus) {
                $step->setDefaultStatus($defaultStatus[0]);
            }
        }

        $this->em->flush();
    }

    private function addProposalFormToProject(Project $project, array $stepsWithProposalForm, array $proposalFormMap): void
    {
        if (empty($stepsWithProposalForm)) {
            return;
        }

        foreach ($stepsWithProposalForm as $stepWithProposalForm) {
            $stepLabel = $stepWithProposalForm['stepLabel'];
            $proposalFormTitle = $stepWithProposalForm['proposalFormTitle'];
            $step = $this->abstractStepRepository->findOneByProjectAndStepLabel($project, $stepLabel);
            $proposalFormId = $proposalFormMap[$proposalFormTitle];
            $proposalForm = $this->proposalFormRepository->find($proposalFormId);
            $step->setProposalForm($proposalForm);
        }

        $this->em->flush();
    }

    private function getStepsWithQuestionnaire(array &$steps): array
    {
        if (empty($steps)) {
            return [];
        }

        $stepsWithQuestionnaire = [];
        foreach ($steps as &$step) {
            if (($step['questionnaire'] ?? null) !== null) {
                $stepsWithQuestionnaire[] = [
                    'stepLabel' => $step['label'],
                    'questionnaireTitle' => $step['questionnaire'],
                ];
                $step['questionnaire'] = null;
            }
        }

        return $stepsWithQuestionnaire;
    }

    private function addQuestionnaireToProject(Project $project, array $stepsWithQuestionnaire, array $questionnaireTitleToIdMap): void
    {
        if (empty($stepsWithQuestionnaire)) {
            return;
        }

        foreach ($stepsWithQuestionnaire as $stepWithQuestionnaire) {
            $stepLabel = $stepWithQuestionnaire['stepLabel'];
            $questionnaireTitle = $stepWithQuestionnaire['questionnaireTitle'];
            $step = $this->abstractStepRepository->findOneByProjectAndStepLabel($project, $stepLabel);
            $questionnaireId = $questionnaireTitleToIdMap[$questionnaireTitle];
            $questionnaire = $this->questionnaireRepository->find($questionnaireId);
            $step->setQuestionnaire($questionnaire);
        }

        $this->em->flush();
    }
}
