<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ProjectDistrictRepository extends EntityRepository
{
    public function getWithPagination(int $offset, int $limit): Paginator
    {
        $qb = $this->createQueryBuilder('d');
        $qb->orderBy('d.name', 'ASC');
        $qb->setFirstResult($offset)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countAll(): int
    {
        $qb = $this->createQueryBuilder('d');
        $qb->select('count(d.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
