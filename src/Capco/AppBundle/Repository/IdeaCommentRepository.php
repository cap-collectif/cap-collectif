<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\ORM\EntityRepository;

/**
 * IdeaCommentRepository.
 */
class IdeaCommentRepository extends EntityRepository
{
    /**
     * Get all enabled comments by idea.
     *
     * @param $idea
     *
     * @return array
     */
    public function getEnabledByIdea($idea, $offset = 0, $limit = 20, $filter)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'i', 'r')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('c.votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->leftJoin('c.Idea', 'i')
            ->andWhere('c.Idea = :idea')
            ->andWhere('c.isTrashed = :notTrashed')
            ->setParameter('idea', $idea)
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
