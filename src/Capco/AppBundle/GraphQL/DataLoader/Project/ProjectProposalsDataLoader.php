<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Project;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Project;
use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Cache\RedisTagCache;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class ProjectProposalsDataLoader extends BatchDataLoader
{
    private $proposalFormProposalsDataLoader;
    private $adapter;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl,
        ProposalFormProposalsDataLoader $proposalFormProposalsDataLoader,
        bool $debug,
        GraphQLCollector $collector,
        bool $enableCache
    ) {
        $this->proposalFormProposalsDataLoader = $proposalFormProposalsDataLoader;
        $this->adapter = $promiseFactory;
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug,
            $collector,
            $enableCache
        );
    }

    public function invalidate(Project $project): void
    {
        $this->invalidateAll();
    }

    public function all(array $keys): Promise
    {
        $results = [];

        foreach ($keys as $key) {
            $results[] = $this->resolveWithoutBatch($key['project'], $key['args']);
        }

        return $this->getPromiseAdapter()->createAll($results);
    }

    protected function serializeKey($key)
    {
        return [
            'projectId' => $key['project']->getId(),
            'args' => $key['args'],
        ];
    }

    private function resolveWithoutBatch(Project $project, Argument $args): Connection
    {
        $emptyConnection = ConnectionBuilder::connectionFromArray([], $args);
        $emptyConnection->totalCount = 0;
        $data = $emptyConnection;

        // For now, to simplify, we consider that only one collect step is possible on a project.
        $step = $project->getFirstCollectStep();
        if ($step && $step->getProposalForm()) {
            $promise =
                // Null visibility will avoid private proposals
                $this->proposalFormProposalsDataLoader
                    ->load([
                        'form' => $step->getProposalForm(),
                        'args' => $args,
                        'viewer' => null,
                        'request' => null,
                    ])
                    ->then(function (Connection $connection) use (&$data) {
                        $data = $connection;
                    });
            $this->adapter->await($promise);
        }

        return $data;
    }

    // This count on all steps, not used.
    // private function getProjectProposalsCount(Project $project): int
    // {
    //     $count = 0;
    //     foreach ($project->getSteps() as $pStep) {
    //         $step = $pStep->getStep();
    //         if ($step->isCollectStep()) {
    //             $count += $this->collectStepProposalsCountResolver->__invoke($step);
    //         }
    //     }

    //     return $count;
    // }
}
