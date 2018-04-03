<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProjectRepository;

class ProjectHelper
{
    protected $projectRepository;
    protected $stepRepository;

    public function __construct(ProjectRepository $projectRepository, AbstractStepRepository $stepRepository)
    {
        $this->projectRepository = $projectRepository;
        $this->stepRepository = $stepRepository;
    }

    public function getAbstractSteps(Project $project)
    {
        return $this->stepRepository->getByProjectSlug($project->getSlug());
    }

    public function getPreviousSteps(AbstractStep $step)
    {
        $position = $step->getPosition();
        $previousSteps = [];
        $projectSteps = $this->getAbstractSteps($step->getProject());
        foreach ($projectSteps as $projectStep) {
            if ($projectStep->getPosition() < $position) {
                $previousSteps[] = $projectStep;
            }
        }

        return $previousSteps;
    }

    public function hasStepWithVotes(Project $project)
    {
        $steps = $this->getAbstractSteps($project);
        foreach ($steps as $step) {
            if (
                $step instanceof ConsultationStep
                || ($step instanceof SelectionStep && true === $step->isVotable())
            ) {
                return true;
            }
        }

        return false;
    }
}
