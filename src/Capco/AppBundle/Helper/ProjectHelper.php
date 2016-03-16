<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Project;

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
      return $this->stepRepository->getByProject($project->getSlug());
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

}
