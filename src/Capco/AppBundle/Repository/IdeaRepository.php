<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * IdeaRepository
 */
class IdeaRepository extends EntityRepository
{
    public function getLast($limit = 1, $offset = 0)
    {
        $qb = $this->createQueryBuilder('i')
            ->select('i.title, i.createdAt, i.voteCount, a.firstname, a.lastname, a.email')
            ->leftJoin('i.Author', 'a')
            ->andWhere('i.isEnabled = :isEnabled')
            ->addOrderBy('i.createdAt', 'DESC')
            ->addGroupBy('i.id')
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
