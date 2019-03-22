<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectsResolver;
use Capco\AppBundle\GraphQL\Resolver\Step\StepVotesCountResolver;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\PromiseAdapter\PromiseAdapterInterface;

class QueryVotesResolver implements ResolverInterface
{
    protected $votesRepository;
    protected $projectsResolver;
    protected $stepVotesCountResolver;
    protected $adapter;

    public function __construct(
        AbstractVoteRepository $votesRepository,
        ProjectsResolver $projectsResolver,
        StepVotesCountResolver $stepVotesCountResolver,
        PromiseAdapterInterface $adapter
    ) {
        $this->votesRepository = $votesRepository;
        $this->projectsResolver = $projectsResolver;
        $this->stepVotesCountResolver = $stepVotesCountResolver;
        $this->adapter = $adapter;
    }

    public function __invoke(Argument $args): Connection
    {
        $totalCount = 0;
        $projectArgs = new Argument(['first' => 100]);
        foreach ($this->projectsResolver->__invoke($projectArgs)->edges as $edge) {
            $totalCount += $this->countProjectVotes($edge->node);
        }

        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->totalCount = $totalCount;

        return $connection;
    }

    public function countProjectVotes(Project $project): int
    {
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
