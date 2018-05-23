<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * VideoRepository.
 */
class VideoRepository extends EntityRepository
{
    /**
     * Get videos.
     *
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

        return $qb->getQuery()->getResult();
    }

    /**
     * Get last videos.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return mixed
     */
    public function getLast($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a, m')
            ->leftJoin('v.Author', 'a')
            ->leftJoin('v.Media', 'm')
            ->orderBy('v.position', 'ASC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb
            ->getQuery()
            ->execute();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
