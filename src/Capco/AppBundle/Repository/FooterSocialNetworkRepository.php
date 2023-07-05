<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * FooterSocialNetworkRepository.
 */
class FooterSocialNetworkRepository extends EntityRepository
{
    public static function getEnabledCacheKey()
    {
        return 'FooterSocialNetworkRepository_getEnabled_resultcache_';
    }

    public function getEnabled(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select('s.title, s.link, s.style')
            ->andWhere('s.isEnabled = :enabled')
            ->addOrderBy('s.position', 'ASC')
            ->setParameter('enabled', true)
        ;

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->enableResultCache(60, self::getEnabledCacheKey())
            ->getArrayResult()
        ;
    }
}
