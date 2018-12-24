<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * FooterSocialNetworkRepository.
 */
class FooterSocialNetworkRepository extends EntityRepository
{
    public function getEnabled()
    {
        $qb = $this->createQueryBuilder('s')
            ->select('s.title, s.link, s.style')
            ->andWhere('s.isEnabled = :enabled')
            ->addOrderBy('s.position', 'ASC')
            ->setParameter('enabled', true);

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 60)
            ->getArrayResult();
    }
}
