<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectVotableStepsResolver implements ResolverInterface
{
    protected $selectionStepRepository;
    protected $collectStepRepository;

    public function __construct(SelectionStepRepository $selectionStepRepository, CollectStepRepository $collectStepRepository)
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
