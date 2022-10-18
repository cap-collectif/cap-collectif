<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Step;

use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Repository\ProposalCollectSmsVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionSmsVoteRepository;
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
    private ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository;
    private ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository,
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
        $this->proposalCollectSmsVoteRepository = $proposalCollectSmsVoteRepository;
        $this->proposalSelectionSmsVoteRepository = $proposalSelectionSmsVoteRepository;
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
            $smsVotes = $this->proposalCollectSmsVoteRepository->countPublishedCollectVoteByStep($step, $onlyAccounted);
            if ($anonymous) {
                
                return $this->proposalCollectSmsVoteRepository->countDistinctPhonePublishedCollectVoteByStep($step, $onlyAccounted);
            }
            $votes = $this->proposalCollectVoteRepository->countPublishedCollectVoteByStep(
                $step,
                $onlyAccounted
            );
            return $votes + $smsVotes;
        }

        if ($step instanceof SelectionStep) {
            $smsVotes = $this->proposalSelectionSmsVoteRepository->countPublishedSelectionVoteByStep($step);
            if ($anonymous) {
                return $this->proposalSelectionSmsVoteRepository->countDistinctPhonePublishedSelectionVoteByStep($step);
            }
            $votes = $this->proposalSelectionVoteRepository->countPublishedSelectionVoteByStep(
                $step,
                $onlyAccounted
            );
            return $votes + $smsVotes;
        }

        if ($step instanceof DebateStep) {
            return $this->voteSearch->countStepVotes($step, compact('anonymous'), 0);
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
