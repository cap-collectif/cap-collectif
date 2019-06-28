<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Comment;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * CommentVoteRepository.
 */
class CommentVoteRepository extends EntityRepository
{
    public function getAllByComment(
        Comment $comment,
        ?int $offset = 0,
        ?int $limit = 10,
        ?string $field = 'PUBLISHED_AT',
        ?string $direction = 'ASC'
    ): Paginator {
        $qb = $this->createQueryBuilder('cv')
            ->andWhere('cv.comment = :comment')
            ->setParameter('comment', $comment);
        if ('PUBLISHED_AT' === $field) {
            $qb->orderBy('cv.createdAt', $direction);
        }

        $qb->setFirstResult($offset)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countAllByComment(Comment $comment): int
    {
        return (int) $this->createQueryBuilder('cv')
            ->select('COUNT(cv.id)')
            ->where('cv.comment = :comment')
            ->setParameter('comment', $comment)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countAllByVoter(User $voter): int
    {
        $qb = $this->createQueryBuilder('cv');

        return (int) $qb
            ->select('COUNT(cv.id)')
            ->where($qb->expr()->eq('cv.user', ':voter'))
            ->leftJoin('cv.comment', 'c')
            ->andWhere('c.published = 1')
            ->setParameter(':voter', $voter)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findAllByVoter(User $voter, ?int $offset = 0, ?int $limit = 100): array
    {
        $qb = $this->createQueryBuilder('cv');

        return $qb
            ->where($qb->expr()->eq('cv.user', ':voter'))
            ->leftJoin('cv.comment', 'c')
            ->andWhere('c.published = 1')
            ->setParameter(':voter', $voter)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
