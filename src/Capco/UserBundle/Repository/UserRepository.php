<?php

namespace Capco\UserBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * UserRepository.
 */
class UserRepository extends EntityRepository
{
    public function getContributionCounters($id)
    {
        $qb = $this->createQueryBuilder('u')
            ->select('count(DISTINCT opinion.id) as opinion_count')
            ->addSelect('count(DISTINCT comment.id) as comment_count')
            ->addSelect('count(DISTINCT argument.id) as argument_count')
            ->addSelect('count(DISTINCT source.id) as source_count')
            ->addSelect('count(DISTINCT idea.id) as idea_count')
            ->addSelect('count(DISTINCT vote.id) as vote_count')
            ->where('u.id = :id')
            ->leftJoin('u.opinions', 'opinion', 'WITH', 'opinion.isEnabled = true')
            ->leftJoin('u.comments', 'comment', 'WITH', 'comment.isEnabled = true')
            ->leftJoin('u.arguments', 'argument', 'WITH', 'argument.isEnabled = true')
            ->leftJoin('u.sources', 'source', 'WITH', 'source.isEnabled = true')
            ->leftJoin('u.ideas', 'idea', 'WITH', 'idea.isEnabled = true')
            ->leftJoin('u.votes', 'vote', 'WITH', 'vote.confirmed = true')
            ->groupBy('u')
            ->setParameter('id', $id);

        return $qb
            ->getQuery()
            ->getSingleResult();
    }
}
