<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;

class ProposalViewerVoteDataLoader extends BatchDataLoader
{
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;
    private $globalIdResolver;
    private $batch = true;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        GlobalIdResolver $globalIdResolver,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        bool $enableCache
    ) {
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->globalIdResolver = $globalIdResolver;

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

    public function invalidate(Proposal $proposal): void
    {
        $this->cache->invalidateTags([$proposal->getId()]);
    }

    public function all(array $keys)
    {
        if ($this->debug) {
            $this->logger->info(
                __METHOD__ .
                    'called for keys : ' .
                    var_export(
                        array_map(function ($key) {
                            return $this->serializeKey($key);
                        }, $keys),
                        true
                    )
            );
        }

        if (!$this->batch) {
            $results = [];
            foreach ($keys as $key) {
                $this->logger->info(
                    __METHOD__ . ' called with ' . json_encode($this->serializeKey($key))
                );

                $results[] = $this->resolveWithoutbatching(
                    $key['proposal'],
                    $key['stepId'],
                    $key['user']
                );
            }

            return $this->getPromiseAdapter()->createAll($results);
        }

        $stepId = $keys[0]['stepId'];
        $user = $keys[0]['user'];
        $step = $this->globalIdResolver->resolve($stepId, $user);

        if (!$step) {
            // TODO fixme https://github.com/cap-collectif/platform/issues/7016
            if (!empty($stepId)) {
                $this->logger->error('Please provide a valid stepId argument.');
            }

            return $this->getPromiseAdapter()->createAll(
                array_map(function ($key) {
                    return null;
                }, $keys)
            );
        }

        $repo = null;
        if ($step instanceof CollectStep) {
            $repo = $this->proposalCollectVoteRepository;
        } elseif ($step instanceof SelectionStep) {
            $repo = $this->proposalSelectionVoteRepository;
        } else {
            $this->logger->error('Please provide a Collect or Selection step');

            return $this->getPromiseAdapter()->createAll(
                array_map(function ($key) {
                    return null;
                }, $keys)
            );
        }

        $batchProposalIds = array_map(function ($key) {
            return $key['proposal']->getId();
        }, $keys);

        $votes = $repo->getByProposalIdsAndStepAndUser($batchProposalIds, $step, $user);
        $results = array_map(function ($key) use ($votes) {
            $found = array_values(
                array_filter($votes, function ($vote) use ($key) {
                    return $vote->getProposal()->getId() === $key['proposal']->getId();
                })
            );

            return $found[0] ?? null;
        }, $keys);

        return $this->getPromiseAdapter()->createAll($results);
    }

    protected function getCacheTag($key): array
    {
        return [$key['proposal']->getId()];
    }

    protected function serializeKey($key): array
    {
        return [
            'proposalId' => $key['proposal']->getId(),
            'stepId' => $key['stepId'],
            'user' => $key['user']->getId()
        ];
    }

    private function resolveWithoutbatching(
        Proposal $proposal,
        string $stepId,
        $user
    ): ?AbstractVote {
        $step = $this->globalIdResolver->resolve($stepId, $user);

        if ($step instanceof CollectStep) {
            return $this->proposalCollectVoteRepository->getByProposalAndStepAndUser(
                $proposal,
                $step,
                $user
            );
        }
        if ($step instanceof SelectionStep) {
            return $this->proposalSelectionVoteRepository->getByProposalAndStepAndUser(
                $proposal,
                $step,
                $user
            );
        }

        return null;
    }
}
