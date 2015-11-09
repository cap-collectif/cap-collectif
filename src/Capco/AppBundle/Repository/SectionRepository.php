<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * SectionRepository.
 */
class SectionRepository extends EntityRepository implements PositionableRepository
{
    /**
     * Get all sections ordered by position.
     *
     * @return mixed
     */
    public function getAllOrderedByPosition()
    {
        $qb = $this->createQueryBuilder('s')
            ->orderBy('s.position', 'ASC');

        return $qb
            ->getQuery()
            ->execute();
    }

    /**
     * Get all enabled sections ordered by position.
     *
     * @return mixed
     */
    public function getEnabledOrderedByPosition()
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->orderBy('s.position', 'ASC');

        return $qb
            ->getQuery()
            ->execute();
    }

    /**
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.enabled = :enabled')
            ->setParameter('enabled', true);
    }
}
