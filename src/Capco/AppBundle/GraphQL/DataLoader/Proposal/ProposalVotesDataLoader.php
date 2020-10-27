<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Search\VoteSearch;
use Capco\AppBundle\Cache\RedisTagCache;
use Symfony\Component\Stopwatch\Stopwatch;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;

class ProposalVotesDataLoader extends BatchDataLoader
{
    private VoteSearch $voteSearch;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        VoteSearch $voteSearch,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        bool $enableCache
    ) {
        $this->voteSearch = $voteSearch;
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
    }

    public function invalidate(Proposal $proposal): void
    {
        $this->cache->invalidateTags([$proposal->getId()]);
    }

    public function all(array $keys)
    {
        if ($this->debug) {
            $this->logger->info(
                __METHOD__ .
                    'called for keys : ' .
                    var_export(
                        array_map(function ($key) {
                            return $this->serializeKey($key);
                        }, $keys),
                        true
                    )
            );
        }
        $connections = $this->resolveBatch($keys);

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function serializeKey($key): array
    {
        return [
            'proposalId' => $key['proposal']->getId(),
            'stepId' => isset($key['step']) ? $key['step']->getId() : null,
            'args' => $key['args']->getArrayCopy(),
            'includeUnpublished' => $key['includeUnpublished'],
            'includeNotAccounted' => $key['includeNotAccounted'],
        ];
    }

    private function resolveBatch(array $keys): array
    {
        $paginatedResults = $this->voteSearch->searchProposalVotes($keys);

        return $this->transformPaginatedResultstoConnections($paginatedResults, $keys);
    }

    private function transformPaginatedResultstoConnections(
        array $paginatedResults,
        array $keys
    ): array {
        $connections = [];
        if (!empty($paginatedResults)) {
            $index = 0;
            foreach ($keys as $i => $key) {
                $paginator = new ElasticsearchPaginator(static function (
                    ?string $cursor,
                    int $limit
                ) use ($paginatedResults, $index) {
                    return $paginatedResults[$index];
                });
                $connections[$i] = $paginator->auto($key['args']);
                if (isset($paginatedResults[$index], $paginatedResults[$index]->totalPointsCount)) {
                    $connections[$i]->{'totalPointsCount'} =
                        $paginatedResults[$index]->totalPointsCount;
                }
                ++$index;
            }
        }

        return $connections;
    }
}
