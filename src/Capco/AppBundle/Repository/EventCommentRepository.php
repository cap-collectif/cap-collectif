<?php
namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Traits\CommentableRepositoryTrait;
use Doctrine\ORM\QueryBuilder;
use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\EventComment;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Model\CommentableInterface;

class EventCommentRepository extends EntityRepository
{
    use CommentableRepositoryTrait;

    private function getByCommentableIdsQueryBuilder(
        string $type,
        array $commentableIds,
        bool $excludeAnswers = true,
        ?User $viewer = null
    ): QueryBuilder {
        $qb = $this->getPublishedNotTrashedQueryBuilder($viewer);
        if ($excludeAnswers && $type === Event::class) {
            $qb->andWhere('c.parent is NULL');
        }
        if ($type === Event::class) {
            $qb->leftJoin('c.Event', 'p');
        }

        if ($type === EventComment::class) {
            $qb->leftJoin('c.parent', 'p');
        }
        $qb->andWhere('p.id IN (:ids)')->setParameter('ids', $commentableIds);
        return $qb;
    }

    private function getByCommentableQueryBuilder(
        CommentableInterface $commentable,
        bool $excludeAnswers = true,
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

    protected function getPublishedNotTrashedQueryBuilder(?User $viewer): QueryBuilder
    {
        return $this->getPublishedQueryBuilder($viewer)->andWhere('c.trashedStatus IS NULL');
    }

    protected function getPublishedQueryBuilder(?User $viewer): QueryBuilder
    {
        $qb = $this->createQueryBuilder('c')->orWhere('c.published = true');
        if ($viewer) {
            $qb->orWhere('c.Author = :viewer AND c.published = false')->setParameter(
                'viewer',
                $viewer
            );
        }

        return $qb;
    }
}
