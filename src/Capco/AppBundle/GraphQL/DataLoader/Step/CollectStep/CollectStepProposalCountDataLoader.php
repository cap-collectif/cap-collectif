<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Step\CollectStep;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;

class CollectStepProposalCountDataLoader extends BatchDataLoader
{
    private $proposalRepository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalRepository $proposalRepository,
        string $cachePrefix,
        int $cacheTtl = RedisCache::ONE_MINUTE
    ) {
        $this->proposalRepository = $proposalRepository;
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl
        );
    }

    public function invalidate(CollectStep $collectStep): void
    {
        foreach ($this->getCacheKeys() as $cacheKey) {
            $decoded = $this->getDecodedKeyFromKey($cacheKey);
            if (false !== strpos($decoded, $collectStep->getId())) {
                $this->cache->deleteItem($cacheKey);
                $this->clear($cacheKey);
                $this->logger->info('Invalidated cache for collectStep ' . $collectStep->getId());
            }
        }
    }

    public function all(array $keys)
    {
        $connections = [];

        foreach ($keys as $key) {
            $this->logger->info(
                __METHOD__ . ' called with ' . json_encode($this->serializeKey($key))
            );

            $connections[] = $this->resolve($key['collectStep']);
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function serializeKey($key)
    {
        return [
            'collectStepId' => $key['collectStep']->getId(),
        ];
    }

    private function resolve(CollectStep $step): int
    {
        // We use mysql to avoid indexation
        return $this->proposalRepository->countPublishedProposalByStepGroupedByStep($step);
    }
}
