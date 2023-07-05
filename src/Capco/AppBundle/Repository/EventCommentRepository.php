<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Traits\CommentableRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class EventCommentRepository extends EntityRepository
{
    use CommentableRepositoryTrait;

    public function getByCommentable(
        CommentableInterface $commentable,
        ?int $offset,
        ?int $limit,
        string $field,
        string $direction,
        ?User $viewer
    ): Paginator {
        $qb = $this->getByCommentableQueryBuilder($commentable, true, $viewer);
        // Pinned always come first
        $qb->addOrderBy('c.pinned', 'DESC');

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('c.publishedAt', $direction);
        }

        if ('UPDATED_AT' === $field) {
            $qb->addOrderBy('c.updatedAt', $direction);
        }

        if ('POPULARITY' === $field) {
            $qb->addOrderBy('c.votesCount', $direction);
        }

        $qb->setFirstResult($offset)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countCommentsAndAnswersByCommentable(
        CommentableInterface $commentable,
        ?User $viewer
    ): int {
        $qb = $this->getByCommentableQueryBuilder($commentable, false, $viewer)->select(
            'count(c.id)'
        );

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countCommentsByCommentable(
        CommentableInterface $commentable,
        ?User $viewer
    ): int {
        $qb = $this->getByCommentableQueryBuilder($commentable, true, $viewer)->select(
            'count(c.id)'
        );

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getViewerPendingModerationComments(
        Event $event,
        User $user,
        ?int $offset = null,
        ?int $limit = null
    ): array {
        $qb = $this->createQueryBuilder('c')
            ->where("c.moderationStatus = 'PENDING'")
            ->andWhere('c.Event = :event')
            ->andWhere('c.author = :user')
            ->setParameters([
                'event' => $event,
                'user' => $user,
            ])
        ;

        $qb->setFirstResult($offset)->setMaxResults($limit);

        return $qb->getQuery()->getResult();
    }

    public function countViewerPendingModerationComments(Event $event, User $user): int
    {
        $qb = $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->where("c.moderationStatus = 'PENDING'")
            ->andWhere('c.Event = :event')
            ->andWhere('c.author = :user')
            ->setParameters(['event' => $event, 'user' => $user])
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    protected function getPublishedNotTrashedQueryBuilder(?User $viewer): QueryBuilder
    {
        return $this->getPublishedQueryBuilder($viewer)->andWhere('c.trashedStatus IS NULL');
    }

    protected function getPublishedQueryBuilder(?User $viewer): QueryBuilder
    {
        $qb = $this->createQueryBuilder('c')->orWhere('c.published = true');
        if ($viewer) {
            $qb->orWhere('c.author = :viewer AND c.published = false')->setParameter(
                'viewer',
                $viewer
            );
        }

        return $qb;
    }

    private function getByCommentableIdsQueryBuilder(
        string $type,
        array $commentableIds,
        bool $excludeAnswers = true,
        ?User $viewer = null
    ): QueryBuilder {
        $qb = $this->getPublishedNotTrashedQueryBuilder($viewer);
        if ($excludeAnswers && Event::class === $type) {
            $qb->andWhere('c.parent is NULL');
        }
        if (Event::class === $type) {
            $qb->leftJoin('c.Event', 'p');
        }

        if (EventComment::class === $type) {
            $qb->leftJoin('c.parent', 'p');
        }
        $qb->andWhere('p.id IN (:ids)')->setParameter('ids', $commentableIds);

        return $qb;
    }

    private function getByCommentableQueryBuilder(
        CommentableInterface $commentable,
        bool $excludeAnswers,
        ?User $viewer
    ): QueryBuilder {
        $qb = $this->getPublishedNotTrashedQueryBuilder($viewer);
        if ($excludeAnswers && $commentable instanceof Event) {
            $qb->andWhere('c.parent is NULL');
        }
        if ($commentable instanceof Event) {
            $qb->andWhere('c.Event = :event')->setParameter('event', $commentable);
        }

        if ($commentable instanceof EventComment) {
            $qb->andWhere('c.parent = :comment')->setParameter('comment', $commentable);
        }

        return $qb;
    }
}
