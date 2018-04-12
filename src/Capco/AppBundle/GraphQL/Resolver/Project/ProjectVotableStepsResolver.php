<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;

class ProjectVotableStepsResolver
{
    protected $selectionStepRepository;
    protected $collectStepRepository;

    public function __construct($selectionStepRepository, $collectStepRepository)
    {
        $this->selectionStepRepository = $selectionStepRepository;
        $this->collectStepRepository = $collectStepRepository;
    }

    public function __invoke(Project $project): iterable
    {
        $collection = $this
          ->selectionStepRepository
          ->getVotableStepsForProject($project)
      ;
        $collectSteps = $this->collectStepRepository->getCollectStepsForProject($project);
        if (count($collectSteps) > 0) {
            $step = $collectSteps[0];
            if ($step->isVotable()) {
                array_push($collection, $step);
            }
        }

        return $collection;
    }
}
