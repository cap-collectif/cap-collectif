<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Idea;

/**
 * IdeaVoteRepository.
 */
class IdeaVoteRepository extends EntityRepository
{
    public function findAllByIdea(Idea $idea)
    {
        return $this->createQueryBuilder('v')
            ->addSelect('u', 'm')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.Media', 'm')
            ->andWhere('v.idea = :idea')
            ->andWhere('v.confirmed = true')
            ->setParameter('idea', $idea)
            ->addOrderBy('v.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
