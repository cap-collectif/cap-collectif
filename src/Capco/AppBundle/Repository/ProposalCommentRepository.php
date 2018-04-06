<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * ProposalRepository.
 */
class ProposalCommentRepository extends EntityRepository
{
    public function getEnabledByProposal($proposal, $offset = 0, $limit = 10, $filter = 'last')
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'i', 'r', 'ans')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('c.votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->leftJoin('c.proposal', 'i')
            ->leftJoin('c.answers', 'ans', 'WITH', 'ans.isEnabled = :enabled AND ans.isTrashed = :notTrashed')
            ->andWhere('c.proposal = :proposal')
            ->andWhere('c.parent is NULL')
            ->andWhere('c.isTrashed = :notTrashed')
            ->setParameter('enabled', true)
            ->setParameter('proposal', $proposal)
            ->setParameter('notTrashed', false)
            ->orderBy('c.pinned', 'DESC')
        ;

        if ('old' === $filter) {
            $qb->addOrderBy('c.updatedAt', 'ASC');
        }

        if ('last' === $filter) {
            $qb->addOrderBy('c.updatedAt', 'DESC');
        }

        if ('popular' === $filter) {
            $qb->addOrderBy('c.votesCount', 'DESC');
        }

        $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countCommentsAndAnswersEnabledByProposal($proposal)
    {
        $qb = $this->getIsEnabledQueryBuilder()
                   ->select('count(c.id)')
                   ->andWhere('c.proposal = :proposal')
                   ->andWhere('c.isTrashed = false')
                   ->setParameter('proposal', $proposal)
                ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.isEnabled = true')
            ->andWhere('c.expired = false')
          ;
    }
}
