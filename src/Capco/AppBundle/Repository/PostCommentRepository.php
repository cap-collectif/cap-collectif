<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Traits\CommentableRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class PostCommentRepository extends EntityRepository
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

    public function countCommentsByCommentable(
        CommentableInterface $commentable,
        ?User $viewer
    ): int {
        $qb = $this->getByCommentableQueryBuilder($commentable, true, $viewer)->select(
            'count(c.id)'
        );

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countCommentsAndAnswersByCommentable(
        CommentableInterface $commentable,
        ?User $viewer
    ): int {
        $qb = $this->getByCommentableQueryBuilder($commentable, false, $viewer)->select(
            'count(c.id)'
        );

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getViewerPendingModerationComments(
        Post $post,
        User $user,
        ?int $offset = null,
        ?int $limit = null
    ): array {
        $qb = $this->createQueryBuilder('c')
            ->where("c.moderationStatus = 'PENDING'")
            ->andWhere('c.post = :post')
            ->andWhere('c.author = :user')
            ->setParameters([
                'post' => $post,
                'user' => $user,
            ])
        ;

        $qb->setFirstResult($offset)->setMaxResults($limit);

        return $qb->getQuery()->getResult();
    }

    public function countViewerPendingModerationComments(Post $post, User $user): int
    {
        $qb = $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->where("c.moderationStatus = 'PENDING'")
            ->andWhere('c.post = :post')
            ->andWhere('c.author = :user')
            ->setParameters(['post' => $post, 'user' => $user])
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @return iterable<PostComment>
     */
    public function findByPost(Post $post): iterable
    {
        $qb = $this->createQueryBuilder('pc')
            ->join('pc.post', 'p')
            ->where('p = :post')
            ->setParameter('post', $post)
        ;

        $postComments = $qb->getQuery()->getResult();

        foreach ($postComments as $postComment) {
            yield $postComment;
        }
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
        if ($excludeAnswers && Post::class === $type) {
            $qb->andWhere('c.parent is NULL');
        }
        if (Post::class === $type) {
            $qb->leftJoin('c.post', 'p');
        }

        if (PostComment::class === $type) {
            $qb->leftJoin('c.parent', 'p');
        }
        $qb->andWhere('p.id IN(:ids)')->setParameter('ids', $commentableIds);

        return $qb;
    }

    private function getByCommentableQueryBuilder(
        CommentableInterface $commentable,
        bool $excludeAnswers = true,
        ?User $viewer = null
    ): QueryBuilder {
        $qb = $this->getPublishedNotTrashedQueryBuilder($viewer);
        if ($excludeAnswers && $commentable instanceof Post) {
            $qb->andWhere('c.parent is NULL');
        }
        if ($commentable instanceof Post) {
            $qb->andWhere('c.post = :post')->setParameter('post', $commentable);
        }

        if ($commentable instanceof PostComment) {
            $qb->andWhere('c.parent = :comment')->setParameter('comment', $commentable);
        }

        return $qb;
    }
}
