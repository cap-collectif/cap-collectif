<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Repository\AbstractStepRepository;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;

class ProposalViewerHasVoteDataLoader extends BatchDataLoader
{
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;
    private $abstractStepRepository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        AbstractStepRepository $abstractStepRepository,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        bool $enableCache
    ) {
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->abstractStepRepository = $abstractStepRepository;

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

        $stepId = $keys[0]['stepId'];
        $user = $keys[0]['user'];
        $step = $this->abstractStepRepository->find($stepId);

        if (!$step) {
            $this->logger->error('Please provide a valid stepId');

            return $this->getPromiseAdapter()->createAll(
                array_map(function ($key) {
                    return false;
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
                    return false;
                }, $keys)
            );
        }

        $batchProposalIds = array_map(function ($key) {
            return $key['proposal']->getId();
        }, $keys);

        $votes = $repo->getByProposalIdsAndStepAndUser($batchProposalIds, $step, $user);
        $results = array_map(function ($key) use ($votes) {
            $found = array_filter($votes, function ($vote) use ($key) {
                return $vote->getProposal()->getId() === $key['proposal']->getId();
            });

            return isset($found[0]) ? true : false;
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
            'user' => $key['user']->getId(),
        ];
    }
}
