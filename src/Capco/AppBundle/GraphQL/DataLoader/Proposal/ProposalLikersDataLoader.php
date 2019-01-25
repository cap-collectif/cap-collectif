<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;

class ProposalLikersDataLoader extends BatchDataLoader
{
    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        bool $enableCache
    ) {
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug,
            $enableCache
        );
    }

    public function invalidate(Proposal $proposal): void
    {
        $this->invalidateAll();
    }

    public function all(array $keys)
    {
        $connections = [];

        foreach ($keys as $key) {
            $this->logger->info(
                __METHOD__ . ' called with ' . var_export($this->serializeKey($key), true)
            );

            $connections[] = $this->resolve($key['proposal']);
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function serializeKey($key)
    {
        if (\is_string($key)) {
            return $key;
        }

        return [
            'proposalId' => $key['proposal']->getId(),
        ];
    }

    private function resolve(Proposal $proposal): iterable
    {
        return $proposal->getLikers();
    }
}
