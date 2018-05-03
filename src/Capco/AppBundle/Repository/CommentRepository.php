<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;

class CommentRepository extends EntityRepository
{
    public function countNotExpired(): int
    {
        $qb = $this->createQueryBuilder('c')
        ->select('count(DISTINCT c.id)')
        ->where('c.expired = false')
    ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getAnonymousCount(): int
    {
        $qb = $this->createQueryBuilder('c')
          ->select('count(DISTINCT c.authorEmail)')
          ->where('c.Author IS NULL')
      ;

        return $qb->getQuery()
          ->getSingleScalarResult()
          ;
    }

    public function getRecentOrdered()
    {
        $qb = $this->createQueryBuilder('c')
            ->select('c.id', 'c.createdAt', 'c.updatedAt', 'a.username as author', 'c.isEnabled as published', 'c.isTrashed as trashed')
            ->where('c.validated = :validated')
            ->leftJoin('c.Author', 'a')
            ->setParameter('validated', false)
        ;

        return $qb->getQuery()
            ->getArrayResult()
            ;
    }

    public function getArrayById($id)
    {
        $qb = $this->createQueryBuilder('c')
            ->select('c.id', 'c.createdAt', 'c.updatedAt', 'a.username as author', 'c.isEnabled as published', 'c.isTrashed as trashed', 'c.body as body')
            ->leftJoin('c.Author', 'a')
            ->where('c.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb->getQuery()
            ->getOneOrNullResult(Query::HYDRATE_ARRAY)
            ;
    }

    /**
     * Get one comment by id.
     *
     * @param $comment
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return mixed
     */
    public function getOneById($comment)
    {
        return $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'r')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('c.votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->andWhere('c.id = :comment')
            ->setParameter('comment', $comment)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Count all comments by user.
     *
     * @param $user
     *
     * @return mixed
     */
    public function countByUser($user)
    {
        return $this->getIsEnabledQueryBuilder()
            ->select('COUNT(c)')
            ->andWhere('c.Author = :author')
            ->setParameter('author', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Get comments by user.
     *
     * @param user
     * @param mixed $user
     *
     * @return mixed
     */
    public function getByUser($user)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm')
            ->leftJoin('c.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->andWhere('c.Author = :user')
            ->setParameter('user', $user)
            ->orderBy('c.updatedAt', 'ASC');

        return $qb
            ->getQuery()
            ->execute();
    }

    public function getEnabledWith($from = null, $to = null)
    {
        $qb = $this->getIsEnabledQueryBuilder();

        if ($from) {
            $qb->andWhere('c.createdAt >= :from')
               ->setParameter('from', $from)
            ;
        }

        if ($to) {
            $qb->andWhere('c.createdAt <= :to')
               ->setParameter('to', $to)
           ;
        }

        return $qb->getQuery()->getResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.isEnabled = true')
            ->andWhere('c.expired = false')
        ;
    }
}
