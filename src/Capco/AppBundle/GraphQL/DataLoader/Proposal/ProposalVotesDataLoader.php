<?php
namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\CacheDataLoader;
use Psr\Cache\CacheItemPoolInterface;

class ProposalVotesDataLoader extends CacheDataLoader
{
    public const COLLECT_STEP_TYPE = 'collect';
    public const SELECTION_STEP_TYPE = 'selection';

    private $proposalVotesCountByStepDataLoader;

    public function __construct(
        CacheItemPoolInterface $cacheItemPool,
        ProposalVotesCountByStepDataLoader $proposalVotesCountByStepDataLoader
    ) {
        $this->proposalVotesCountByStepDataLoader = $proposalVotesCountByStepDataLoader;
        parent::__construct($cacheItemPool);
    }

    public function load(int $count, Proposal $proposal, string $stepType)
    {
        $key = $this->getCacheKeyNameByValue($proposal->getId() . $stepType);
        $cacheItem = $this->cacheItemPool->getItem($key);

        if (!$cacheItem->isHit()) {
            $cacheItem->set($count);
            $this->cacheItemPool->save($cacheItem);
        }

        return $cacheItem->get();
    }

    public function invalidate(Proposal $proposal, string $stepType): bool
    {
        $key = $this->getCacheKeyNameByValue($proposal->getId() . $stepType);

        return $this->cacheItemPool->deleteItem($key);
    }

    public function invalidateAll(Proposal $proposal, ?AbstractStep $step = null): bool
    {
        [$collectKey, $selectionKey] = [
            $this->getCacheKeyNameByValue($proposal->getId() . self::COLLECT_STEP_TYPE),
            $this->getCacheKeyNameByValue($proposal->getId() . self::SELECTION_STEP_TYPE),
        ];
        if ($step) {
            $this->proposalVotesCountByStepDataLoader->invalidate($proposal, $step);
        }

        return (
            $this->cacheItemPool->deleteItem($collectKey) &&
            $this->cacheItemPool->deleteItem($selectionKey)
        );
    }
}
