<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * SiteImageRepository.
 */
class SiteImageRepository extends EntityRepository
{
    public function getValuesIfEnabled()
    {
        return $this->getEntityManager()
            ->createQueryBuilder()
            ->select('p', 'm')
            ->from($this->getClassName(), 'p', 'p.keyname')
            ->leftJoin('p.media', 'm')
            ->andWhere('p.isEnabled = 1')
            ->groupBy('p.keyname')
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 60)
            ->getResult();
    }
}
