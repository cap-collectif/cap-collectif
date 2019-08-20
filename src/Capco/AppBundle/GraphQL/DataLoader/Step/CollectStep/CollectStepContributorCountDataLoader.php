<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Step\CollectStep;

use Capco\AppBundle\DataCollector\GraphQLCollector;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Step\StepContributorResolver;

class CollectStepContributorCountDataLoader extends BatchDataLoader
{
    private $stepContributorResolver;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        StepContributorResolver $stepContributorResolver,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        bool $enableCache
    ) {
        $this->stepContributorResolver = $stepContributorResolver;
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

    public function invalidate(CollectStep $collectStep): void
    {
        $this->cache->invalidateTags([$collectStep->getId()]);
    }

    public function all(array $keys)
    {
        $connections = [];

        foreach ($keys as $key) {
            $connections[] = $this->resolve($key['collectStep']);
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function getCacheTag($key): array
    {
        return [$key['collectStep']->getId()];
    }

    protected function serializeKey($key): array
    {
        return [
            'collectStepId' => $key['collectStep']->getId()
        ];
    }

    private function resolve(CollectStep $step): int
    {
        return $this->stepContributorResolver
            ->__invoke($step, new Argument(['first' => 0]))
            ->getTotalCount();
    }
}
