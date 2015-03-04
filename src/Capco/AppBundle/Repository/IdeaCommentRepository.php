<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;

/**
 * IdeaCommentRepository
 */
class IdeaCommentRepository extends EntityRepository
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

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
