<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisCache;
use Doctrine\Common\Collections\Collection;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;

class ProposalProgressStepDataLoader extends BatchDataLoader
{
    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl = RedisCache::ONE_MINUTE
    ) {
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl
        );
    }

    /**
     * Not used at the moment.
     */
    // public function invalidate(Proposal $proposal): void
    // {
    //     foreach ($this->getCacheKeys() as $cacheKey) {
    //         $decoded = $this->getDecodedKeyFromKey($cacheKey);
    //         if (false !== strpos($decoded, $proposal->getId())) {
    //             $this->cache->deleteItem($cacheKey);
    //             $this->clear($cacheKey);
    //             $this->logger->info('Invalidated cache for proposal ' . $proposal->getId());
    //         }
    //     }
    // }

    public function all(array $keys)
    {
        $connections = [];

        foreach ($keys as $key) {
            $connections[] = $this->resolve($key);
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function serializeKey($key): array
    {
        return [
            'proposalId' => $key->getId(),
        ];
    }

    private function resolve(Proposal $proposal): Collection
    {
        return $proposal->getProgressSteps();
    }
}
