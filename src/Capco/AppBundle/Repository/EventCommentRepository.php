<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * EventCommentRepository.
 */
class EventCommentRepository extends EntityRepository
{
    public function getEnabledByEvent($event, $offset = 0, $limit = 10, $filter = 'last')
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'e', 'r')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('c.votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->leftJoin('c.Event', 'e')
            ->andWhere('c.Event = :event')
            ->andWhere('c.parent is NULL')
            ->andWhere('c.isTrashed = :notTrashed')
            ->setParameter('event', $event)
            ->setParameter('notTrashed', false)
        ;

        if ($filter === 'old') {
            $qb->addOrderBy('c.updatedAt', 'ASC');
        }

        if ($filter === 'last') {
            $qb->addOrderBy('c.updatedAt', 'DESC');
        }

        if ($filter === 'popular') {
            $qb->addOrderBy('c.voteCount', 'DESC');
        }

        $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countCommentsAndAnswersEnabledByEvent($event)
    {
        $qb = $this->getIsEnabledQueryBuilder()
                   ->select('count(c.id)')
                   ->leftJoin('c.Event', 'e')
                   ->andWhere('c.Event = :event')
                   ->setParameter('event', $event)
                ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
