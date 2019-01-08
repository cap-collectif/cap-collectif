<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\Step\CollectStepProposalCountResolver;

class ProjectProposalsResolver implements ResolverInterface
{
    protected $adapter;
    private $collectStepResolver;

    public function __construct(
        CollectStepProposalCountResolver $collectStepResolver,
        PromiseAdapterInterface $adapter
    ) {
        $this->adapter = $adapter;
        $this->collectStepResolver = $collectStepResolver;
    }

    public function __invoke(Project $project, ?Arg $args = null): Connection
    {
        if (!$args) {
            $args = new Arg(['first' => 0]);
        }

        // Setup dataloader here instead
        $totalCount = $this->getProjectProposalsCount($project);

        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });

        return $paginator->auto($args, $totalCount);
    }

    public function getProjectProposalsCount(Project $project): int
    {
        $count = 0;
        foreach ($project->getSteps() as $pStep) {
            $step = $pStep->getStep();
            if ($step->isCollectStep()) {
                $count += $this->collectStepResolver->__invoke($step);
            }
        }

        return $count;
    }
}
