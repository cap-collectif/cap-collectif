<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Step\StepPointsVotesCountResolver;
use Capco\AppBundle\GraphQL\Resolver\Step\StepVotesCountResolver;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\AppBundle\Repository\ProposalStepPaperVoteCounterRepository;
use Capco\AppBundle\Search\VoteSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\PromiseAdapter\PromiseAdapterInterface;

class QueryVotesResolver implements QueryInterface
{
    public function __construct(protected AbstractVoteRepository $votesRepository, protected QueryProjectsResolver $projectsResolver, protected StepVotesCountResolver $stepVotesCountResolver, protected StepPointsVotesCountResolver $stepPointsVotesCountResolver, private readonly VoteSearch $voteSearch, protected PromiseAdapterInterface $adapter, private readonly ProposalStepPaperVoteCounterRepository $proposalStepPaperVoteCounterRepository)
    {
    }

    public function __invoke(Argument $args): Connection
    {
        $totalCount = 0;
        $projectArgs = new Argument(['first' => 100]);
        $onlyAccounted = true === $args->offsetGet('onlyAccounted');
        foreach ($this->projectsResolver->resolve($projectArgs)->getEdges() as $edge) {
            $totalCount += $this->countProjectVotes($edge->getNode(), $onlyAccounted);
        }

        $paperVotesCount = $this->proposalStepPaperVoteCounterRepository->countAll();
        $totalCount += $paperVotesCount;

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
                })
            ;

            $this->adapter->await($promise);
        }

        return $count;
    }
}
