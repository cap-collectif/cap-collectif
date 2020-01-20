<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Search\VoteSearch;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;

class ProposalVotesDataLoader extends BatchDataLoader
{
    private $voteSearch;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        VoteSearch $voteSearch,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
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
            // ?TODO? toGlobalId
            'stepId' => isset($key['step']) ? $key['step']->getId() : null,
            'args' => $key['args']->getArrayCopy(),
            'includeUnpublished' => $key['includeUnpublished']
        ];
    }

    private function resolveBatch($keys): array
    {
        $steps = array_unique(
            array_map(function ($key) {
                return $key['step'] ?? null;
            }, $keys)
        );
        $step = $steps[0];
        $includeUnpublished = $keys[0]['includeUnpublished'];
        $connections = [];
        $paginatedResults = $this->voteSearch->searchProposalVotes(
            $step,
            $keys,
            $includeUnpublished
        );
        foreach ($keys as $key) {
            $paginator = new ElasticsearchPaginator(static function (
                ?string $cursor,
                int $limit
            ) use ($paginatedResults, $key) {
                foreach ($paginatedResults as $proposalId => $paginatedResult) {
                    if ($key['proposal']->getId() === $proposalId) {
                        return $paginatedResult;
                    }
                }

                return [];
            });
            $connections[] = $paginator->auto($key['args']);
        }

        return $connections;
    }
}
