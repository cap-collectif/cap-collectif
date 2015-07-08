<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * PostCommentRepository.
 */
class PostCommentRepository extends EntityRepository
{
    /**
     * Get all enabled comments by post.
     *
     * @param $idea
     *
     * @return array
     */
    public function getEnabledByPost($post)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'p', 'r')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('c.votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->leftJoin('c.Post', 'p')
            ->andWhere('c.Post = :post')
            ->andWhere('c.isTrashed = :notTrashed')
            ->setParameter('post', $post)
            ->setParameter('notTrashed', false)
            ->addOrderBy('c.updatedAt', 'ASC')
        ;

        return $qb->getQuery()
            ->getResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
