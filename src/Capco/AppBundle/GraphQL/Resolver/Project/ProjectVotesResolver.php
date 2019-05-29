<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Capco\AppBundle\GraphQL\Resolver\Step\StepVotesCountResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectVotesResolver implements ResolverInterface
{
    protected $adapter;
    private $stepVotesCountResolver;

    public function __construct(
        StepVotesCountResolver $stepVotesCountResolver,
        PromiseAdapterInterface $adapter
    ) {
        $this->adapter = $adapter;
        $this->stepVotesCountResolver = $stepVotesCountResolver;
    }

    public function __invoke(Project $project, ?Arg $args = null): Connection
    {
        if (!$args) {
            $args = new Arg(['first' => 0]);
        }
        $totalCount = $this->countProjectVotes($project);

        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });

        return $paginator->auto($args, $totalCount);
    }

    public function countProjectVotes(Project $project): int
    {
        if ($project->isExternal()) {
            return $project->getExternalVotesCount();
        }

        $totalCount = 0;

        foreach ($project->getSteps() as $pas) {
            $totalCount += $this->countStepVotes($pas->getStep());
        }

        return $totalCount;
    }

    public function countStepVotes(AbstractStep $step): int
    {
        $count = 0;
        if ($step instanceof ConsultationStep) {
            $count = $step->getVotesCount();
        } elseif ($step instanceof SelectionStep || $step instanceof CollectStep) {
            $promise = $this->stepVotesCountResolver
                ->__invoke($step)
                ->then(function ($value) use (&$count) {
                    $count += $value;
                });

            $this->adapter->await($promise);
        }

        return $count;
    }
}
