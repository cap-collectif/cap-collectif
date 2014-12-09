<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

use Capco\AppBundle\Entity\Idea;
use Capco\UserBundle\Entity\User;

/**
 * IdeaVoteRepository
 */
class IdeaVoteRepository extends EntityRepository
{
    public function countForUserAndIdea(User $user, Idea $idea)
    {
        $qb = $this->createQueryBuilder('v')
            ->select('count(v.id) as total')
            ->andWhere('v.Voter = :user')
            ->andWhere('v.Idea = :idea')
            ->setParameter('user', $user)
            ->setParameter('idea', $idea);

        return $qb
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function hasVote(User $user, Idea $idea)
    {
        $qb = $this->createQueryBuilder('v')
            ->andWhere('v.Voter = :user')
            ->andWhere('v.Idea = :idea')
            ->setParameter('user', $user)
            ->setParameter('idea', $idea);

        return $qb
            ->getQuery()
            ->getOneOrNullResult();

    }
}
