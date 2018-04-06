<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Comment;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * CommentVoteRepository.
 */
class CommentVoteRepository extends EntityRepository
{
    public function getAllByComment(Comment $comment, ?int $offset = 0, ?int $limit = 10, ?string $field = 'CREATED_AT', ?string $direction = 'ASC'): Paginator
    {
        $qb = $this->createQueryBuilder('cv')
            ->andWhere('cv.comment = :comment')
            ->setParameter('comment', $comment)
        ;

        if ('CREATED_AT' === $field) {
            $qb->orderBy('cv.createdAt', $direction);
        }

        $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit);

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
}
