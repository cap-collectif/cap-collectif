<?php
namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\CacheDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Psr\Cache\CacheItemPoolInterface;

class ProposalVotesCountByStepDataLoader extends CacheDataLoader
{
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;

    public function __construct(
        CacheItemPoolInterface $cacheItemPool,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository
    ) {
        parent::__construct($cacheItemPool);
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
    }

    public function load(Proposal $proposal, AbstractStep $step, bool $includeExpired)
    {
        $cacheKey = $this->getCacheKeyNameByParameters([
            'proposalId' => $proposal->getId(),
            'stepId' => $step->getId(),
            'includeExpired' => $includeExpired,
        ]);
        $cacheItem = $this->cacheItemPool->getItem($cacheKey);
        if (!$cacheItem->isHit()) {
            if ($step instanceof SelectionStep) {
                $count = $this->proposalSelectionVoteRepository->countVotesByProposalAndStep(
                    $proposal,
                    $step,
                    $includeExpired
                );
            } elseif ($step instanceof CollectStep) {
                $count = $this->proposalCollectVoteRepository->countVotesByProposalAndStep(
                    $proposal,
                    $step,
                    $includeExpired
                );
            } else {
                $count = 0;
            }
            $cacheItem->set($count);
            $this->cacheItemPool->save($cacheItem);
        }

        return $cacheItem->get();
    }

    public function invalidate(Proposal $proposal, AbstractStep $step): bool
    {
        $includeExpiredKey = $this->getCacheKeyNameByParameters([
            'proposalId' => $proposal->getId(),
            'stepId' => $step->getId(),
            'includeExpired' => true,
        ]);
        $notIncludeExpiredKey = $this->getCacheKeyNameByParameters([
            'proposalId' => $proposal->getId(),
            'stepId' => $step->getId(),
            'includeExpired' => false,
        ]);

        return (
            $this->cacheItemPool->deleteItem($includeExpiredKey) &&
            $this->cacheItemPool->deleteItem($notIncludeExpiredKey)
        );
    }
}
