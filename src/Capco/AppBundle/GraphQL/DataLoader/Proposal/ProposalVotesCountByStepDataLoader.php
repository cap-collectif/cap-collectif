<?php
namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\CacheDataLoader;

class ProposalVotesCountByStepDataLoader extends CacheDataLoader
{
    public function load(int $count, Proposal $proposal, AbstractStep $step)
    {
        $key = $this->getCacheKeyNameByValue($proposal->getId() . $step->getId());
        $cacheItem = $this->cacheItemPool->getItem($key);
        if (!$cacheItem->isHit()) {
            $cacheItem->set($count);
            $this->cacheItemPool->save($cacheItem);
        }

        return $cacheItem->get();
    }

    public function invalidate(Proposal $proposal, AbstractStep $step): bool
    {
        $key = $this->getCacheKeyNameByValue($proposal->getId() . $step->getId());

        return $this->cacheItemPool->deleteItem($key);
    }
}
