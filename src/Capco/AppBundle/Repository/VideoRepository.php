<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

/**
 * VideoRepository
 */
class VideoRepository extends EntityRepository
{
    /**
     * Get videos
     * @return array
     */
    public function getAll()
    {

        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a, m')
            ->leftJoin('v.Author', 'a')
            ->leftJoin('v.Media', 'm')
            ->orderBy('v.position', 'ASC')
        ;

        return $query = $qb->getQuery()->getResult();

    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
