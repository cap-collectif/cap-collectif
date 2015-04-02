<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * EventCommentRepository.
 */
class EventCommentRepository extends EntityRepository
{
    /**
     * Get all enabled comments by event.
     *
     * @param $event
     *
     * @return array
     */
    public function getEnabledByEvent($event)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'e', 'r')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('c.Votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->leftJoin('c.Event', 'e')
            ->andWhere('c.Event = :event')
            ->andWhere('c.isTrashed = :notTrashed')
            ->setParameter('event', $event)
            ->setParameter('notTrashed', false)
            ->addOrderBy('c.updatedAt', 'ASC')
        ;

        return $qb->getQuery()
            ->getResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
