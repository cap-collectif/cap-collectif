<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\ConsultationRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Twig\Extension\RuntimeExtensionInterface;

class GraphQLRuntime implements RuntimeExtensionInterface
{
    public function __construct(
        private readonly CollectStepRepository $collectStepRepo,
        private readonly QuestionnaireRepository $questionnaireRepo,
        private readonly ConsultationRepository $consultationRepository,
        private readonly ProjectRepository $projectRepo
    ) {
    }

    public function getOffsetToCursor(int $key): string
    {
        return ConnectionBuilder::offsetToCursor($key);
    }

    public function getCollectSteps(): array
    {
        $steps = $this->collectStepRepo->findAll();

        return array_map(static fn (CollectStep $step) => [
            'id' => GlobalId::toGlobalId('CollectStep', $step->getId()),
            'label' => (string) $step,
        ], $steps);
    }

    public function getQuestionnaires(): array
    {
        $questionnaires = $this->questionnaireRepo->findAll();

        return array_map(static fn (Questionnaire $questionnaire) => [
            'id' => GlobalId::toGlobalId('Questionnaire', $questionnaire->getId()),
            'label' => (string) $questionnaire,
        ], $questionnaires);
    }

    public function getConsultations(): array
    {
        $consultations = $this->consultationRepository->findAll();

        return array_map(static fn (Consultation $consultation) => [
            'id' => GlobalId::toGlobalId('Consultation', $consultation->getId()),
            'label' => (string) $consultation,
        ], $consultations);
    }

    public function getProjects(): array
    {
        $projects = $this->projectRepo->findAll();

        return array_map(static fn (Project $project) => [
            'id' => GlobalId::toGlobalId('Project', $project->getId()),
            'label' => (string) $project,
        ], $projects);
    }
}
