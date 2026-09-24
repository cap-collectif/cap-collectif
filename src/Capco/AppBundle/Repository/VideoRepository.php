<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

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
            ->leftJoin('v.author', 'a')
            ->leftJoin('v.media', 'm')
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
            ->leftJoin('v.author', 'a')
            ->leftJoin('v.media', 'm')
            ->orderBy('v.position', 'ASC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->execute();
    }

    // The translations join multiplies rows, so the Doctrine Paginator is needed to keep LIMIT/OFFSET
    // counting videos rather than joined rows (same approach as GlobalDistrictRepository).
    public function getPaginated(?string $search = null, ?int $offset = null, ?int $limit = null): Paginator
    {
        $qb = $this->getPaginatedQueryBuilder($search)
            ->addSelect('a')
            ->leftJoin('v.author', 'a')
            ->orderBy('v.position', 'ASC')
            ->addOrderBy('v.id', 'ASC')
        ;

        if (null !== $offset) {
            $qb->setFirstResult($offset);
        }

        if (null !== $limit) {
            $qb->setMaxResults($limit);
        }

        return new Paginator($qb);
    }

    public function countAll(?string $search = null): int
    {
        $qb = $this->getPaginatedQueryBuilder($search)->select('COUNT(DISTINCT v.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true)
        ;
    }

    private function getPaginatedQueryBuilder(?string $search = null): QueryBuilder
    {
        $qb = $this->createQueryBuilder('v')
            ->leftJoin('v.translations', 't')
        ;

        if (null !== $search && '' !== trim($search)) {
            $qb
                ->andWhere('t.title LIKE :search')
                ->setParameter('search', '%' . trim($search) . '%')
            ;
        }

        return $qb;
    }
}
