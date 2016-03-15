<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Entity\Steps\AbstractStep;

class ProjectHelper
{
  protected $projectRepository;

  public function __construct(ProjectRepository $projectRepository)
  {
      $this->projectRepository = $projectRepository;
  }

  public function getPreviousSteps(AbstractStep $step)
  {
      $position = $step->getPosition();
      $previousSteps = [];
      $projectSteps = $this->projectRepository->find($step->getProject())->getSteps();
      foreach ($projectSteps as $projectStep) {
          if ($projectStep->getPosition() < $position) {
              $previousSteps[] = $projectStep;
          }
      }
      return $previousSteps;
  }

}
