<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Step\CollectStep;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Step\StepContributorResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class CollectStepContributorCountDataLoader extends BatchDataLoader
{
    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        private readonly StepContributorResolver $stepContributorResolver,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        bool $enableCache
    ) {
        parent::__construct(
            $this->all(...),
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
            'collectStepId' => $key['collectStep']->getId(),
        ];
    }

    private function resolve(CollectStep $step): int
    {
        return $this->stepContributorResolver
            ->__invoke($step, new Argument(['first' => 0]))
            ->getTotalCount()
        ;
    }
}
