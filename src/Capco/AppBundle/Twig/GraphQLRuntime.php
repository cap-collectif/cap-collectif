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
    private $collectStepRepo;
    private $questionnaireRepo;
    private $consultationRepository;
    private $projectRepo;

    public function __construct(
        CollectStepRepository $collectStepRepo,
        QuestionnaireRepository $questionnaireRepo,
        ConsultationRepository $consultationRepository,
        ProjectRepository $projectRepo
    ) {
        $this->collectStepRepo = $collectStepRepo;
        $this->questionnaireRepo = $questionnaireRepo;
        $this->projectRepo = $projectRepo;
        $this->consultationRepository = $consultationRepository;
    }

    public function getOffsetToCursor(int $key): string
    {
        return ConnectionBuilder::offsetToCursor($key);
    }

    public function getCollectSteps(): array
    {
        $steps = $this->collectStepRepo->findAll();

        return array_map(static function (CollectStep $step) {
            return [
                'id' => GlobalId::toGlobalId('CollectStep', $step->getId()),
                'label' => (string) $step,
            ];
        }, $steps);
    }

    public function getQuestionnaires(): array
    {
        $questionnaires = $this->questionnaireRepo->findAll();

        return array_map(static function (Questionnaire $questionnaire) {
            return [
                'id' => GlobalId::toGlobalId('Questionnaire', $questionnaire->getId()),
                'label' => (string) $questionnaire,
            ];
        }, $questionnaires);
    }

    public function getConsultations(): array
    {
        $consultations = $this->consultationRepository->findAll();

        return array_map(static function (Consultation $consultation) {
            return [
                'id' => GlobalId::toGlobalId('Consultation', $consultation->getId()),
                'label' => (string) $consultation,
            ];
        }, $consultations);
    }

    public function getProjects(): array
    {
        $projects = $this->projectRepo->findAll();

        return array_map(static function (Project $project) {
            return [
                'id' => GlobalId::toGlobalId('Project', $project->getId()),
                'label' => (string) $project,
            ];
        }, $projects);
    }
}
