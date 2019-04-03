<?php

namespace Capco\AppBundle\GraphQL\DataLoader\User;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Search\EventSearch;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class UserAuthorsOfEventDataLoader extends BatchDataLoader
{
    public $enableBatch = true;
    public $useElasticsearch = true;
    private $userRepository;
    private $eventSearch;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        EventSearch $eventSearch,
        UserRepository $userRepository,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        bool $enableCache
    ) {
        $this->eventSearch = $eventSearch;
        $this->userRepository = $userRepository;

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

        if ($this->enableBatch) {
            $connections = $this->resolveBatch($keys);
        } else {
            $connections = $this->resolveWithoutBatch($keys);
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function normalizeValue($value)
    {
        // TODO we can do better here
        return $value;
    }

    protected function denormalizeValue($value)
    {
        // TODO we can do better here
        return $value;
    }

    protected function getCacheTag($key): array
    {
        return [$key['args']];
    }

    protected function serializeKey($key)
    {
        return [
            'args' => $key['args'],
        ];
    }

    private function resolveBatch($keys): array
    {
        $userIds = $this->eventSearch->getDistinctAllAuthorsId();
        $connections = array_map(
            function ($key, $index) use ($userIds) {
                $paginator = new Paginator(function () use ($userIds) {
                    return $this->userRepository->getUsersByIds($userIds);
                });
                $totalCount = \count($userIds);

                return $paginator->auto($key['args'], (int) $totalCount);
            },
            $keys,
            array_keys($keys)
        );

        return $connections;
    }

    private function resolveWithoutBatch($keys): array
    {
        $connections = [];
        foreach ($keys as $key) {
            $connections[] = $this->resolve($key['args']);
        }

        return $connections;
    }

    private function resolve(Argument $args): Connection
    {
        try {
            $userIds = $this->eventSearch->getDistinctAllAuthorsId();
            $paginator = new Paginator(function () use ($userIds) {
                return $this->userRepository->getUsersByIds($userIds);
            });
            $totalCount = \count($userIds);

            return $paginator->auto($args, $totalCount);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException($exception->getMessage());
        }
    }
}
