<?php
namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\CacheDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Psr\Cache\CacheItemPoolInterface;

class ProposalVotesDataLoader extends CacheDataLoader
{
    public const COLLECT_STEP_TYPE = 'collect';
    public const SELECTION_STEP_TYPE = 'selection';

    private $proposalVotesCountByStepDataLoader;
    private $proposalSelectionVoteRepository;
    private $proposalCollectVoteRepository;

    public function __construct(
        CacheItemPoolInterface $cacheItemPool,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalVotesCountByStepDataLoader $proposalVotesCountByStepDataLoader
    ) {
        $this->proposalVotesCountByStepDataLoader = $proposalVotesCountByStepDataLoader;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        parent::__construct($cacheItemPool);
    }

    public function load(Proposal $proposal, string $stepType, bool $includeExpired)
    {
        $key = $this->getCacheKeyNameByParameters([
            'proposalId' => $proposal->getId(),
            'stepType' => $stepType,
            'includeExpired' => $includeExpired,
        ]);
        $cacheItem = $this->cacheItemPool->getItem($key);

        if (!$cacheItem->isHit()) {
            if ($stepType === self::SELECTION_STEP_TYPE) {
                $count = $this->proposalSelectionVoteRepository->countVotesByProposal(
                    $proposal,
                    $includeExpired
                );
            } elseif ($stepType === self::COLLECT_STEP_TYPE) {
                $count = $this->proposalCollectVoteRepository->countVotesByProposal(
                    $proposal,
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

    public function invalidate(Proposal $proposal, string $stepType): bool
    {
        $includeExpiredKey = $this->getCacheKeyNameByParameters([
            'proposalId' => $proposal->getId(),
            'stepType' => $stepType,
            'includeExpired' => true,
        ]);
        $notIncludeExpiredKey = $this->getCacheKeyNameByParameters([
            'proposalId' => $proposal->getId(),
            'stepType' => $stepType,
            'includeExpired' => false,
        ]);

        return (
            $this->cacheItemPool->deleteItem($includeExpiredKey) &&
            $this->cacheItemPool->deleteItem($notIncludeExpiredKey)
        );
    }

    public function invalidateAll(Proposal $proposal, ?AbstractStep $step = null): bool
    {
        $invalidateVotesByStepSuccess = true;
        if ($step) {
            $invalidateVotesByStepSuccess = $this->proposalVotesCountByStepDataLoader->invalidate(
                $proposal,
                $step
            );
        }

        return (
            $this->invalidate($proposal, self::SELECTION_STEP_TYPE) &&
            $this->invalidate($proposal, self::COLLECT_STEP_TYPE) &&
            $invalidateVotesByStepSuccess
        );
    }
}
