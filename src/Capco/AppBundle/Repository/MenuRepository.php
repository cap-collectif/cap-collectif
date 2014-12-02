<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * MenuRepository
 */
class MenuRepository extends EntityRepository
{
    public function findIdForType($type)
    {
        $qb = $this->createQueryBuilder('m')
            ->andWhere('m.type = :type')
            ->setParameter('type', $type)
        ;

        return $qb
            ->getQuery()
            ->getSingleResult();
    }
}
