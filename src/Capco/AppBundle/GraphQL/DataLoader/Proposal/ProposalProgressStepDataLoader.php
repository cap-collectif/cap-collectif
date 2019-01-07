<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Cache\RedisTagCache;
use Doctrine\Common\Collections\Collection;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;

class ProposalProgressStepDataLoader extends BatchDataLoader
{
    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
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

    public function invalidate(Proposal $proposal): void
    {
        // TODO
        $this->invalidateAll();
    }

    public function all(array $keys)
    {
        $connections = [];

        // TODO add some batching here
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
