<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class ProjectTypeRepository extends EntityRepository
{
    public static function findAllCacheKey()
    {
        return 'ProjectTypeRepository_findAll_resultcache_';
    }

    public function findAll()
    {
        return $this->createQueryBuilder('p')
            ->orderBy('p.slug', 'ASC')
            ->getQuery()
            ->useQueryCache(true)
            ->enableResultCache(60, self::findAllCacheKey())
            ->getArrayResult()
        ;
    }
}
