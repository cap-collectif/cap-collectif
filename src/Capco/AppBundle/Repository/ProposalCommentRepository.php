<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Proposal;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * ProposalRepository.
 */
class ProposalCommentRepository extends EntityRepository
{
    public function getEnabledByProposal(Proposal $proposal, int $offset = 0, int $limit = 10, string $filter = 'last'): Paginator
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

    public function getByProposal(Proposal $proposal, int $offset, int $limit, string $field, string $direction): Paginator
    {
        $qb = $this->createQueryBuilder('c');
        $qb->addSelect('aut', 'm', 'v', 'i', 'r', 'ans')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('c.votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->leftJoin('c.proposal', 'i')
            ->leftJoin('c.answers', 'ans')
            ->andWhere('c.proposal = :proposal')
            ->andWhere('c.parent is NULL')
            ->setParameter('proposal', $proposal)
            ->addOrderBy('c.pinned', $direction);

        if ('CREATED_AT' === $field) {
            $qb->addOrderBy('c.createdAt', $direction);
        }

        if ('UPDATED_AT' === $field) {
            $qb->addOrderBy('c.updatedAt', $direction);
        }

        if ('POPULARITY' === $field) {
            $qb->addOrderBy('c.votesCount', $direction);
        }

        $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countCommentsAndAnswersEnabledByProposal(Proposal $proposal): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
                   ->select('count(c.id)')
                   ->andWhere('c.proposal = :proposal')
                   ->andWhere('c.isTrashed = false')
                   ->setParameter('proposal', $proposal)
                ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.isEnabled = true')
            ->andWhere('c.expired = false')
          ;
    }
}
