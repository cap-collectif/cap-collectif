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

    public function getAnonymousVotersByIdea(Idea $idea)
    {
        return $this->createQueryBuilder('v')
            ->select('v.username', 'v.email')
            ->andWhere('v.idea = :idea')
            ->andWhere('v.confirmed = true')
            ->andWhere('v.username IS NOT NULL')
            ->setParameter('idea', $idea)
            ->addOrderBy('v.updatedAt', 'DESC')
            ->getQuery()
            ->getArrayResult();
    }

    public function getMemberVotersByIdea(Idea $idea)
    {
        return $this->createQueryBuilder('v')
            ->select('u.username as username', 'u.email as email')
            ->andWhere('v.idea = :idea')
            ->andWhere('v.confirmed = true')
            ->leftJoin('v.user', 'u')
            ->andWhere('v.user IS NOT NULL')
            ->setParameter('idea', $idea)
            ->addOrderBy('v.updatedAt', 'DESC')
            ->getQuery()
            ->getArrayResult();
    }

    public function getVotesForIdea(Idea $idea, $limit = null, $offset = 0)
    {
        $qb = $this->createQueryBuilder('iv')
            ->where('iv.idea = :idea')
            ->setParameter('idea', $idea)
            ->addOrderBy('iv.createdAt', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->getResult();
    }
}
