<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Step\StepPointsVotesCountResolver;
use Capco\AppBundle\Search\VoteSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Capco\AppBundle\GraphQL\Resolver\Step\StepVotesCountResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryVotesResolver implements ResolverInterface
{
    protected AbstractVoteRepository $votesRepository;
    protected QueryProjectsResolver $projectsResolver;
    protected StepVotesCountResolver $stepVotesCountResolver;
    protected StepPointsVotesCountResolver $stepPointsVotesCountResolver;
    protected PromiseAdapterInterface $adapter;
    private VoteSearch $voteSearch;

    public function __construct(
        AbstractVoteRepository $votesRepository,
        QueryProjectsResolver $projectsResolver,
        StepVotesCountResolver $stepVotesCountResolver,
        StepPointsVotesCountResolver $stepPointsVotesCountResolver,
        VoteSearch $voteSearch,
        PromiseAdapterInterface $adapter
    ) {
        $this->votesRepository = $votesRepository;
        $this->projectsResolver = $projectsResolver;
        $this->stepVotesCountResolver = $stepVotesCountResolver;
        $this->stepPointsVotesCountResolver = $stepPointsVotesCountResolver;
        $this->adapter = $adapter;
        $this->voteSearch = $voteSearch;
    }

    public function __invoke(Argument $args): Connection
    {
        $totalCount = 0;
        $projectArgs = new Argument(['first' => 100]);
        $onlyAccounted = true === $args->offsetGet('onlyAccounted');
        foreach ($this->projectsResolver->resolve($projectArgs)->getEdges() as $edge) {
            $totalCount += $this->countProjectVotes($edge->getNode(), $onlyAccounted);
        }

        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }

    public function countProjectVotes(Project $project, bool $onlyAccounted): int
    {
        $totalCount = 0;

        foreach ($project->getSteps() as $pas) {
            if ($pas->getStep()) {
                $totalCount += $this->countStepVotes($pas->getStep(), $onlyAccounted);
            }
        }

        return $totalCount;
    }

    public function countStepVotes(AbstractStep $step, bool $onlyAccounted): int
    {
        $count = 0;
        if ($step instanceof ConsultationStep) {
            $count = $this->voteSearch->searchConsultationStepVotes($step, 0)->getTotalCount();
        } elseif ($step instanceof SelectionStep || $step instanceof CollectStep) {
            $promise = $this->stepVotesCountResolver
                ->__invoke($step, $onlyAccounted)
                ->then(function ($value) use (&$count) {
                    $count += $value;
                });

            $this->adapter->await($promise);
        }

        return $count;
    }
}
