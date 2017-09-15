<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Traits\AnonymousVoteRepositoryTrait;
use Doctrine\ORM\EntityRepository;

/**
 * IdeaVoteRepository.
 */
class IdeaVoteRepository extends EntityRepository
{
    use AnonymousVoteRepositoryTrait;

    public function findAllByIdea(Idea $idea)
    {
        return $this->createQueryBuilder('v')
            ->addSelect('u', 'm')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.Media', 'm')
            ->andWhere('v.idea = :idea')
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
            ->andWhere('v.username IS NOT NULL')
            ->setParameter('idea', $idea)
            ->addOrderBy('v.createdAt', 'DESC')
            ->getQuery()
            ->getArrayResult();
    }

    public function getMemberVotersByIdea(Idea $idea)
    {
        return $this->createQueryBuilder('v')
            ->select('u.username as username', 'u.email as email')
            ->andWhere('v.idea = :idea')
            ->leftJoin('v.user', 'u')
            ->andWhere('v.user IS NOT NULL')
            ->setParameter('idea', $idea)
            ->addOrderBy('v.createdAt', 'DESC')
            ->getQuery()
            ->getArrayResult();
    }

    public function getVotesCountForIdea(Idea $idea)
    {
        $qb = $this->createQueryBuilder('iv');

        $qb->select('count(iv.id)')
            ->where('iv.idea = :idea')
            ->setParameter('idea', $idea)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
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
