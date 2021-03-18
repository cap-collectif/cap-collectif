<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Step;

use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Search\VoteSearch;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Cache\RedisTagCache;
use Symfony\Component\Stopwatch\Stopwatch;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;

class StepVotesCountDataLoader extends BatchDataLoader
{
    private ProposalCollectVoteRepository $proposalCollectVoteRepository;
    private ProposalSelectionVoteRepository $proposalSelectionVoteRepository;
    private VoteSearch $voteSearch;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        VoteSearch $voteSearch,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        bool $enableCache
    ) {
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->voteSearch = $voteSearch;
        parent::__construct(
            [$this, 'all'],
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
            $connections[] = $this->resolve($key['step'], $key['onlyAccounted'], $key['anonymous']);
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    public function resolve(AbstractStep $step, bool $onlyAccounted, ?bool $anonymous = null): int
    {
        if ($step instanceof CollectStep) {
            return $this->proposalCollectVoteRepository->countPublishedCollectVoteByStep(
                $step,
                $onlyAccounted
            );
        }

        if ($step instanceof SelectionStep) {
            return $this->proposalSelectionVoteRepository->countPublishedSelectionVoteByStep(
                $step,
                $onlyAccounted
            );
        }

        if ($step instanceof DebateStep) {
            return $this->voteSearch->countProjectVotes(
                $step->getProject(),
                compact('anonymous'),
                0
            );
        }

        throw new \RuntimeException('Access denied');
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
            'anonymous' => $key['anonymous'],
        ];
    }
}
