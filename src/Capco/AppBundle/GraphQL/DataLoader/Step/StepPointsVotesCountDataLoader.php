<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Step;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class StepPointsVotesCountDataLoader extends BatchDataLoader
{
    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
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

    public function invalidate(AbstractStep $step): void
    {
        $this->cache->invalidateTags([$step->getId()]);
    }

    public function all(array $keys)
    {
        $connections = [];

        foreach ($keys as $key) {
            $connections[] = $this->resolve($key['step'], $key['onlyAccounted'] ?? true);
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    public function resolve(AbstractStep $step, bool $onlyAccounted): int
    {
        if ($step instanceof CollectStep) {
            return $this->proposalCollectVoteRepository->countPointsOnPublishedCollectVoteByStep(
                $step,
                $onlyAccounted
            );
        }

        if ($step instanceof SelectionStep) {
            return $this->proposalSelectionVoteRepository->countPointsOnPublishedSelectionVoteByStep(
                $step,
                $onlyAccounted
            );
        }

        throw new \InvalidArgumentException(sprintf('"%s" Unknown collect or selection step "%s" for .', __METHOD__, $step->getId()));
    }

    protected function getCacheTag($key): array
    {
        return [$key['step']->getId()];
    }

    protected function serializeKey($key): array
    {
        return [
            'stepId' => $key['step']->getId(),
            'onlyAccounted' => $key['onlyAccounted'],
        ];
    }
}
