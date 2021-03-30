<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Search\VoteSearch;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\Resolver\Step\StepVotesCountResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectVotesResolver implements ResolverInterface
{
    protected PromiseAdapterInterface $adapter;
    private StepVotesCountResolver $stepVotesCountResolver;
    private VoteSearch $voteSearch;

    public function __construct(
        StepVotesCountResolver $stepVotesCountResolver,
        VoteSearch $voteSearch,
        PromiseAdapterInterface $adapter
    ) {
        $this->adapter = $adapter;
        $this->stepVotesCountResolver = $stepVotesCountResolver;
        $this->voteSearch = $voteSearch;
    }

    public function __invoke(Project $project, ?Arg $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Arg(['first' => 0]);
        }

        $totalCount = $this->countProjectVotes($project, $args->offsetGet('anonymous'));

        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });

        return $paginator->auto($args, $totalCount);
    }

    public function countProjectVotes(Project $project, ?bool $anonymous = null): int
    {
        if ($project->isExternal()) {
            return $project->getExternalVotesCount() ?? 0;
        }

        $totalCount = 0;

        foreach ($project->getSteps() as $pas) {
            $totalCount += $this->countStepVotes($pas->getStep(), $anonymous);
        }

        return $totalCount;
    }

    public function countStepVotes(AbstractStep $step, ?bool $anonymous): int
    {
        $count = 0;
        if (false === $anonymous || null === $anonymous) {
            if ($step instanceof ConsultationStep) {
                $count = $this->voteSearch->searchConsultationStepVotes($step, 0)->getTotalCount();
            } elseif (
                $step instanceof SelectionStep ||
                $step instanceof CollectStep ||
                $step instanceof DebateStep
            ) {
                $promise = $this->stepVotesCountResolver
                    ->__invoke($step, true, $anonymous)
                    ->then(function ($value) use (&$count) {
                        $count += $value;
                    });

                $this->adapter->await($promise);
            }
        } elseif ($step instanceof DebateStep && true === $anonymous) {
            $promise = $this->stepVotesCountResolver
                ->__invoke($step, true, $anonymous)
                ->then(function ($value) use (&$count) {
                    $count += $value;
                });

            $this->adapter->await($promise);
        }

        return $count;
    }
}
