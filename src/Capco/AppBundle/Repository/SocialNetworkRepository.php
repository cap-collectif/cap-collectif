<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * SocialNetworkRepository.
 */
class SocialNetworkRepository extends EntityRepository
{
    /**
     * get all social network enabled.
     *
     * @return array
     */
    public function getEnabled()
    {
        $qb = $this->createQueryBuilder('s')
            ->leftJoin('s.media', 'm')
            ->addSelect('m')
            ->andWhere('s.isEnabled = :isEnabled')
            ->addOrderBy('s.position', 'ASC')
            ->setParameter('isEnabled', true);

        return $qb->getQuery()->getResult();
    }
}
