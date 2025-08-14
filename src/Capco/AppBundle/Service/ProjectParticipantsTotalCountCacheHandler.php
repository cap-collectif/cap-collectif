<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Project;
use InvalidArgumentException;
use Psr\Cache\CacheItemInterface;
use Symfony\Component\HttpKernel\KernelInterface;

class ProjectParticipantsTotalCountCacheHandler
{
    public const CACHE_KEY_PREFIX = 'project_participants_totalCount_';

    public function __construct(
        private readonly RedisCache $cache,
        private readonly KernelInterface $kernel
    ) {
    }

    public function incrementTotalCount(Project $project, ?callable $conditionCallBack = null): void
    {
        $updateCallable = fn (int $count) => $count + 1;

        $this->updateTotalCount(updateCallable: $updateCallable, project: $project, conditionCallBack: $conditionCallBack);
    }

    public function decrementTotalCount(Project $project, ?callable $conditionCallBack = null): void
    {
        $updateCallable = fn (int $count) => $count - 1;

        $this->updateTotalCount(updateCallable: $updateCallable, project: $project, conditionCallBack: $conditionCallBack);
    }

    public function updateTotalCount(callable $updateCallable, Project $project, ?callable $conditionCallBack = null): int
    {
        $cacheKey = $this->getCacheKey($project->getId());

        /** @var CacheItemInterface $cachedTotalCount */
        $cachedTotalCount = $this->cache->getItem($cacheKey);

        $condition = true;
        if (null !== $conditionCallBack) {
            $result = $conditionCallBack($cachedTotalCount);
            if (!\is_bool($result)) {
                throw new InvalidArgumentException('Callback must return a boolean.');
            }
            $condition = $result;
        }

        if ($condition) {
            $value = $cachedTotalCount->get();
            $expiresAfter = 'test' === $this->kernel->getEnvironment() ? 0 : RedisCache::FIVE_MINUTES;
            $cachedTotalCount->set($updateCallable($value))->expiresAfter($expiresAfter);
            $this->cache->save($cachedTotalCount);
        }

        return $cachedTotalCount->get() ?? 0;
    }

    private function getCacheKey(string $projectId): string
    {
        return sprintf(self::CACHE_KEY_PREFIX . '%s', $projectId);
    }
}
