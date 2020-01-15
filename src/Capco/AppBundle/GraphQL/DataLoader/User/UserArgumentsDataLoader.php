<?php

namespace Capco\AppBundle\GraphQL\DataLoader\User;

use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\GraphQL\DataLoader\DataLoaderUtils;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Cache\RedisTagCache;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class UserArgumentsDataLoader extends BatchDataLoader
{
    /**
     * @var ArgumentRepository
     */
    private $argumentRepository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        ArgumentRepository $argumentRepository,
        bool $enableCache
    ) {
        $this->argumentRepository = $argumentRepository;

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

        $batchUsersIds = array_map(function ($key) {
            return $key['user']->getId();
        }, $keys);

        $viewer = $keys[0]['viewer'];
        $limit = 10000;
        $offset = 0;
        $aclDisabled = $keys[0]['aclDisabled'];

        $totalCounts = $aclDisabled ? $this->argumentRepository->countAllByUsersId($batchUsersIds) : $this->argumentRepository->countByUsersIds($batchUsersIds, $viewer);
        $arguments = $this->argumentRepository->findByUsersIds($batchUsersIds, $aclDisabled, $viewer, $offset, $limit);
        $results = array_map(function ($key) use ($arguments, $totalCounts) {
            $argumentsForKey = array_values(
                array_filter($arguments, function (Argument $argument) use ($key) {
                    return $argument->getAuthor()->getId() === $key['user']->getId();
                })
            );
            DataLoaderUtils::getAfterOffset($argumentsForKey, $key);
            DataLoaderUtils::getBeforeOffset($argumentsForKey, $key);
            $paginator = new Paginator(function (int $offset, int $limit) use ($argumentsForKey){
                return $argumentsForKey ?: [];
            });
            $totalCountKey = array_search($key['user']->getId(), array_column($totalCounts, 'user_id'), true);

            $totalCount = $totalCountKey !== false ? (int) $totalCounts[$totalCountKey]['totalCount'] : 0;
            return $paginator->auto($key['args'], $totalCount);
        }, $keys);
        return $this->getPromiseAdapter()->createAll($results);
    }

    protected function getCacheTag($key): array
    {
        return [$key['user']->getId()];
    }

    protected function serializeKey($key): array
    {
        return [
            'userId' => $key['user']->getId(),
            'args' => $key['args'] ?? [],
            'viewerId' => $key['viewer'] ? $key['viewer']->getId() : null,
            'aclDisabled' => $key['aclDisabled']
        ];
    }

}

