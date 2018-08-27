<?php
namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Event;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

class EventCommentRepository extends EntityRepository
{
    public function getEnabledByEvent($event, $offset = 0, $limit = 10, $filter = 'last')
    {
        $qb = $this->getPublishedQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'e', 'r', 'ans')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('c.votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->leftJoin('c.Event', 'e')
            ->leftJoin('c.answers', 'ans', 'WITH', 'ans.trashedAt IS NULL')
            ->andWhere('c.Event = :event')
            ->andWhere('c.parent is NULL')
            ->andWhere('c.trashedAt IS NULL')
            ->setParameter('event', $event)
            ->orderBy('c.pinned', 'DESC');
        if ('old' === $filter) {
            $qb->addOrderBy('c.createdAt', 'ASC');
        }

        if ('last' === $filter) {
            $qb->addOrderBy('c.createdAt', 'DESC');
        }

        if ('popular' === $filter) {
            $qb->addOrderBy('c.votesCount', 'DESC');
        }

        $qb->setFirstResult($offset)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countCommentsAndAnswersEnabledByEvent(Event $event): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('count(c.id)')
            ->andWhere('c.Event = :event')
            ->andWhere('c.trashedAt IS NULL')
            ->setParameter('event', $event);
        return $qb->getQuery()->getSingleScalarResult();
    }

    protected function getPublishedQueryBuilder()
    {
        return $this->createQueryBuilder('c')->andWhere('c.published = true');
    }
}
