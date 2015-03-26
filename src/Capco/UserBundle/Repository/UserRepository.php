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
            ->where('u.id = :id')
            ->innerJoin('u.opinions', 'opinion', 'WITH', 'opinion.isEnabled = true')
            ->innerJoin('u.comments', 'comment', 'WITH', 'comment.isEnabled = true')
            ->innerJoin('u.arguments', 'argument', 'WITH', 'argument.isEnabled = true')
            ->innerJoin('u.sources', 'source', 'WITH', 'source.isEnabled = true')
            ->innerJoin('u.ideas', 'idea', 'WITH', 'idea.isEnabled = true')
            ->groupBy('u')
            ->setParameter('id', $id);

        return $qb
            ->getQuery()
            ->getSingleResult();
    }
}
