<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * AbstractCommentRepository.
 */
class AbstractCommentRepository extends EntityRepository
{
    /**
     * Get one comment by id.
     *
     * @param $comment
     *
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneById($comment)
    {
        return $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'r')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
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
            ->andWhere('c.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
