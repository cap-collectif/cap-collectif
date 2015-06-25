<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;


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
    public function getEnabledByPost($post, $offset = 0, $limit = 10, $filter = 'last')
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
        ;

        if ($filter === 'last') {
            $qb->addOrderBy('c.updatedAt', 'DESC');
        }

        if ($filter === 'popular') {
            $qb->addOrderBy('c.voteCount', 'DESC');
        }

        $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }


    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
