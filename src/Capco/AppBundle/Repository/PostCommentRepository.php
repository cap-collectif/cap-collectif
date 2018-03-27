<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Post;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * PostCommentRepository.
 */
class PostCommentRepository extends EntityRepository
{
    public function getEnabledByPost($post, $offset = 0, $limit = 10, $filter = 'last')
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'p', 'r', 'ans')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('c.votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->leftJoin('c.post', 'p')
            ->leftJoin('c.answers', 'ans', 'WITH', 'ans.isEnabled = :enabled AND ans.isTrashed = :notTrashed')
            ->andWhere('c.post = :post')
            ->andWhere('c.parent is NULL')
            ->andWhere('c.isTrashed = :notTrashed')
            ->setParameter('enabled', true)
            ->setParameter('notTrashed', false)
            ->setParameter('post', $post)
            ->orderBy('c.pinned', 'DESC')
        ;

        if ('old' === $filter) {
            $qb->addOrderBy('c.updatedAt', 'ASC');
        }

        if ('last' === $filter) {
            $qb->addOrderBy('c.updatedAt', 'DESC');
        }

        if ('popular' === $filter) {
            $qb->addOrderBy('c.votesCount', 'DESC');
        }

        $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function getAllByPost(Post $post, ?int $offset = 0, ?int $limit = 10, ?string $filter = 'last'): Paginator
    {
        $qb = $this->createQueryBuilder('c')
            ->addSelect('aut', 'm', 'v', 'p', 'r', 'ans')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('c.votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->leftJoin('c.post', 'p')
            ->leftJoin('c.answers', 'ans')
            ->andWhere('c.post = :post')
            ->andWhere('c.parent is NULL')
            ->setParameter('post', $post)
            ->orderBy('c.pinned', 'DESC')
        ;

        if ('old' === $filter) {
            $qb->addOrderBy('c.updatedAt', 'ASC');
        }

        if ('last' === $filter) {
            $qb->addOrderBy('c.updatedAt', 'DESC');
        }

        if ('popular' === $filter) {
            $qb->addOrderBy('c.votesCount', 'DESC');
        }

        $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countCommentsAndAnswersEnabledByPost($post)
    {
        $qb = $this->getIsEnabledQueryBuilder()
                   ->select('count(c.id)')
                   ->andWhere('c.post = :post')
                   ->andWhere('c.isTrashed = false')
                   ->setParameter('post', $post)
                ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countAllCommentsAndAnswersByPost(Post $post): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('count(c.id)')
            ->andWhere('c.post = :post')
            ->setParameter('post', $post)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.isEnabled = true')
            ->andWhere('c.expired = false')
          ;
    }
}
