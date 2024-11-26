<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Project;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Search\ProposalSearch;
use Capco\UserBundle\Entity\User;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class ProjectProposalsDataLoader extends BatchDataLoader
{
    private readonly ProposalSearch $proposalSearch;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        ProposalSearch $proposalSearch,
        RedisTagCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        bool $enableCache
    ) {
        parent::__construct(
            $this->all(...),
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug,
            $collector,
            $stopwatch,
            $enableCache
        );
        $this->proposalSearch = $proposalSearch;
    }

    public function invalidate(Project $project): void
    {
        $this->invalidateAll();
    }

    public function all(array $keys): Promise
    {
        $results = [];

        foreach ($keys as $key) {
            $results[] = $this->resolveWithoutBatch($key['project'], $key['args'], $key['viewer']);
        }

        return $this->getPromiseAdapter()->createAll($results);
    }

    protected function serializeKey($key)
    {
        return [
            'projectId' => $key['project']->getId(),
            'args' => $key['args']->getArrayCopy(),
            'viewer' => $key['viewer'] ? $key['viewer']->getId() : null,
        ];
    }

    private function resolveWithoutBatch(
        Project $project,
        Argument $args,
        $viewer
    ): ConnectionInterface {
        [
            $providedFilters['term'],
            $providedFilters['state'],
            $providedFilters['step'],
            $providedFilters['category'],
            $providedFilters['status'],
            $providedFilters['district'],
            $providedFilters['trashedStatus'],
            $providedFilters['theme'],
            $ordersBy,
            $isExporting,
        ] = [
            $args->offsetGet('term'),
            $args->offsetGet('state'),
            $args->offsetGet('step'),
            $args->offsetGet('category'),
            $args->offsetGet('status'),
            $args->offsetGet('district'),
            $args->offsetGet('trashedStatus'),
            $args->offsetGet('theme'),
            $args->offsetGet('orderBy'),
            $args->offsetGet('includeUnpublished'),
        ];

        if (!$isExporting) {
            if (!$viewer instanceof User || ($viewer instanceof User && !$viewer->isAdmin() && !$viewer->getOrganizationId())) {
                $providedFilters['visible'] = true;
            }
        }

        $orders = array_map(function ($order) {
            return ProposalSearch::findOrderFromFieldAndDirection($order['field'], $order['direction']);
        }, $ordersBy);

        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $project,
            $orders,
            $providedFilters
        ) {
            return $this->proposalSearch->searchProposalsByProject(
                $project,
                $orders[0],
                $providedFilters,
                $limit,
                $cursor
            );
        });

        return $paginator->auto($args);
    }
}
