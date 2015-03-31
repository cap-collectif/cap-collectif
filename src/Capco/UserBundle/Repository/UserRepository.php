<?php

namespace Capco\UserBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * UserRepository.
 */
class UserRepository extends EntityRepository
{
    public function getOpinionCounters()
    {
        $qb = $this->createQueryBuilder('u')
            ->select('count(DISTINCT opinion.id) as opinion_count')
            ->leftJoin('u.opinions', 'opinion', 'WITH', 'opinion.isEnabled = true')
            ->groupBy('u')
        ;

        return $qb->getQuery()->getResult();
    }

    public function getCommentCounters()
    {
        $qb = $this->createQueryBuilder('u')
            ->select('count(DISTINCT comment.id) as comment_count')
            ->leftJoin('u.comments', 'comment', 'WITH', 'comment.isEnabled = true')
            ->groupBy('u')
        ;

        return $qb->getQuery()->getResult();
    }

    public function getArgumentCounters()
    {
        $qb = $this->createQueryBuilder('u')
            ->select('count(DISTINCT argument.id) as argument_count')
            ->leftJoin('u.arguments', 'argument', 'WITH', 'argument.isEnabled = true')
            ->groupBy('u')
        ;

        return $qb->getQuery()->getResult();
    }

    public function getSourceCounters()
    {
        $qb = $this->createQueryBuilder('u')
            ->select('count(DISTINCT source.id) as source_count')
            ->leftJoin('u.sources', 'source', 'WITH', 'source.isEnabled = true')
            ->groupBy('u')
        ;

        return $qb->getQuery()->getResult();
    }

    public function getIdeaCounters()
    {
        $qb = $this->createQueryBuilder('u')
            ->select('count(DISTINCT idea.id) as idea_count')
            ->leftJoin('u.ideas', 'idea', 'WITH', 'idea.isEnabled = true')
            ->groupBy('u')
        ;

        return $qb->getQuery()->getResult();
    }

    public function getVoteCounters()
    {
        $qb = $this->createQueryBuilder('u')
            ->select('count(DISTINCT vote.id) as vote_count')
            ->leftJoin('u.votes', 'vote', 'WITH', 'vote.confirmed = true')
            ->groupBy('u')
        ;

        return $qb->getQuery()->getResult();
    }
}
