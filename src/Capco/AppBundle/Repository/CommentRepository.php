<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;

/**
 * CommentRepository
 */
class CommentRepository extends EntityRepository
{

    /**
     * Get all enabled comments by idea
     *
     * @param $idea
     * @return array
     */
    public function getEnabledByIdea($idea)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'i', 'r')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('c.Votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->leftJoin('c.Idea', 'i')
            ->andWhere('c.Idea = :idea')
            ->andWhere('c.isTrashed = :notTrashed')
            ->setParameter('idea', $idea)
            ->setParameter('notTrashed', false)
            ->addOrderBy('c.updatedAt', 'DESC')
        ;

        return $qb->getQuery()
            ->getResult();
    }

    /**
     * Get one comment by id
     * @param $comment
     * @return mixed
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneById($comment)
    {
        return $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'i', 'r')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('c.Votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->leftJoin('c.Idea', 'i')
            ->andWhere('c.id = :comment')
            ->setParameter('comment', $comment)
            ->getQuery()
            ->getOneOrNullResult();

    }

    /**
     * Count all comments by user
     * @param $user
     * @return mixed
     */
    public function countByUser($user){

        return $this->getIsEnabledQueryBuilder()
            ->select('COUNT(c)')
            ->andWhere('c.Author = :author')
            ->setParameter('author', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Get comments by user
     * @param user
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
            ->orderBy('c.updatedAt', 'DESC');

        return $qb
            ->getQuery()
            ->execute();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
