<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class SourceCategoryRepository extends EntityRepository
{
    public function countAll(): int
    {
        return (int) $this->createQueryBuilder('sc')
            ->select('count(sc.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * @return array<int, \Capco\AppBundle\Entity\SourceCategory>
     */
    public function findAllPaginated(?int $offset = null, ?int $limit = null): array
    {
        $qb = $this->createQueryBuilder('sc')->addOrderBy('sc.createdAt', 'ASC');

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getResult();
    }
}
