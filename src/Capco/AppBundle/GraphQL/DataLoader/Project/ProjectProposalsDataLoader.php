<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Project;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Search\ProposalSearch;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Project;
use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Cache\RedisTagCache;
use Symfony\Component\Stopwatch\Stopwatch;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;

class ProjectProposalsDataLoader extends BatchDataLoader
{
    private ProposalSearch $proposalSearch;

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
            [$this, 'all'],
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
            $providedFilters['step'],
            $providedFilters['category'],
            $providedFilters['status'],
            $providedFilters['district'],
            $providedFilters['trashedStatus'],
            $field,
            $direction,
            $isExporting,
        ] = [
            $args->offsetGet('step'),
            $args->offsetGet('category'),
            $args->offsetGet('status'),
            $args->offsetGet('district'),
            $args->offsetGet('trashedStatus'),
            $args->offsetGet('orderBy')['field'],
            $args->offsetGet('orderBy')['direction'],
            $args->offsetGet('includeUnpublished'),
        ];

        if (!$isExporting) {
            if (!$viewer instanceof User || ($viewer instanceof User && !$viewer->isAdmin())) {
                $providedFilters['visible'] = true;
            }
        }

        $order = ProposalSearch::findOrderFromFieldAndDirection($field, $direction);

        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $project,
            $order,
            $providedFilters
        ) {
            return $this->proposalSearch->searchProposalsByProject(
                $project,
                $order,
                $providedFilters,
                $limit,
                $cursor
            );
        });

        return $paginator->auto($args);
    }
}
