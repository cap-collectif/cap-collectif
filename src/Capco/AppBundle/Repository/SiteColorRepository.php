<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class SiteColorRepository extends EntityRepository
{
    public static function getValuesIfEnabledCacheKey()
    {
        return 'SiteColorRepository_getValuesIfEnabled_resultcache_';
    }

    public function getValuesIfEnabled()
    {
        return $this->getEntityManager()
            ->createQueryBuilder()
            ->from($this->getClassName(), 'p', 'p.keyname')
            ->select('p.value', 'p.keyname')
            ->andWhere('p.isEnabled = 1')
            ->groupBy('p.keyname')
            ->getQuery()
            ->useQueryCache(true)
            ->enableResultCache(60, self::getValuesIfEnabledCacheKey())
            ->getResult();
    }
}
