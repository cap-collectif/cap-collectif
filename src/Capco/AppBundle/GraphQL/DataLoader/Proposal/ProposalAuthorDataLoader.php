<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Cache\RedisCache;
use Capco\UserBundle\Entity\User;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;

class ProposalAuthorDataLoader extends BatchDataLoader
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
        return [
            'proposalId' => $key['proposal']->getId(),
        ];
    }

    private function resolve(Proposal $proposal): User
    {
        return $proposal->getAuthor();
    }
}
