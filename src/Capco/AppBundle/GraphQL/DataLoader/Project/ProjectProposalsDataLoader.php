<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Project;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Project;
use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Cache\RedisTagCache;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Capco\AppBundle\GraphQL\Resolver\Step\CollectStepProposalCountResolver;

class ProjectProposalsDataLoader extends BatchDataLoader
{
    private $collectStepResolver;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl,
        CollectStepProposalCountResolver $collectStepResolver,
        bool $debug,
        GraphQLCollector $collector,
        bool $enableCache
    ) {
        $this->collectStepResolver = $collectStepResolver;
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
        $totalCount = $this->getProjectProposalsCount($project);

        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });

        return $paginator->auto($args, $totalCount);
    }

    private function getProjectProposalsCount(Project $project): int
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
