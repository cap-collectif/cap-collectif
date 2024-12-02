<?php

namespace Capco\AppBundle\GraphQL\DataLoader\User;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Search\ArgumentSearch;
use Capco\UserBundle\Entity\User;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class UserArgumentsDataLoader extends BatchDataLoader
{
    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        private readonly ArgumentSearch $argumentSearch,
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
    }

    public function invalidate(User $user): void
    {
        $this->cache->invalidateTags([$user->getId()]);
    }

    public function all(array $keys)
    {
        if ($this->debug) {
            $this->logger->info(
                __METHOD__ .
                    'called for keys : ' .
                    var_export(
                        array_map(fn ($key) => $this->serializeKey($key), $keys),
                        true
                    )
            );
        }
        $viewer = $keys[0]['viewer'];
        $argumentPaginatedResults = $this->argumentSearch->getArgumentsByUserIds($viewer, $keys);
        $connections = [];
        if (!empty($argumentPaginatedResults)) {
            foreach ($keys as $i => $key) {
                $paginator = new ElasticsearchPaginator(
                    static fn (?string $cursor, int $limit) => $argumentPaginatedResults[$i]
                );
                $connections[] = $paginator->auto($key['args']);
            }
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function getCacheTag($key): array
    {
        return [$key['user']->getId()];
    }

    protected function serializeKey($key): array
    {
        return [
            'userId' => $key['user']->getId(),
            'args' => $key['args'] ? $key['args']->getArrayCopy() : [],
            'viewerId' => $key['viewer'] ? $key['viewer']->getId() : null,
            'aclDisabled' => $key['aclDisabled'],
        ];
    }
}
