<?php

namespace Capco\AppBundle\GraphQL\DataLoader\User;

use Capco\AppBundle\Search\ArgumentSearch;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Cache\RedisTagCache;
use Symfony\Component\Stopwatch\Stopwatch;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;

class UserArgumentsDataLoader extends BatchDataLoader
{
    private ArgumentSearch $argumentSearch;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        ArgumentSearch $argumentSearch,
        bool $enableCache
    ) {
        $this->argumentSearch = $argumentSearch;
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
                        array_map(function ($key) {
                            return $this->serializeKey($key);
                        }, $keys),
                        true
                    )
            );
        }
        $viewer = $keys[0]['viewer'];
        $argumentPaginatedResults = $this->argumentSearch->getArgumentsByUserIds($viewer, $keys);
        $connections = [];
        if (!empty($argumentPaginatedResults)) {
            foreach ($keys as $i => $key) {
                $paginator = new ElasticsearchPaginator(static function (
                    ?string $cursor,
                    int $limit
                ) use ($argumentPaginatedResults, $i) {
                    return $argumentPaginatedResults[$i];
                });
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
