<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * ThemeRepository
 */
class ThemeRepository extends EntityRepository
{
    public function getLast($limit = 1, $offset = 0)
    {
        $qb = $this->createQueryBuilder('t')
            ->select('t.title, t.slug, count(c.id) as consultationsCount, count(i.id) as ideasCount')
            ->leftJoin('t.Consultations', 'c')
            ->leftJoin('t.Ideas', 'i')
            ->andWhere('t.isEnabled = :isEnabled')
            ->andWhere('c.isEnabled IS NULL OR c.isEnabled = :isEnabled')
            ->andWhere('i.isEnabled IS NULL OR i.isEnabled = :isEnabled')
            ->addOrderBy('t.createdAt', 'DESC')
            ->addGroupBy('t.id')
            ->setParameter('isEnabled', true);

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb
            ->getQuery()
            ->getScalarResult();
    }
}
