<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * FooterSocialNetworkRepository
 */
class FooterSocialNetworkRepository extends EntityRepository
{
    public function getEnabled()
    {
        $qb = $this->createQueryBuilder('s')
            ->select('s.title, s.link, s.style')
            ->andWhere('s.isEnabled = :isEnabled')
            ->addOrderBy('s.position', 'ASC')
            ->setParameter('isEnabled', true);

        return $qb
            ->getQuery()
            ->getScalarResult();
    }
}
