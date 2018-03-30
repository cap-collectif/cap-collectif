<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Proposal;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ReportingRepository extends EntityRepository
{
    public function getByProposal(Proposal $proposal, int $offset, int $limit, string $field, string $direction): Paginator
    {
        $qb = $this->createQueryBuilder('r');

        $qb->andWhere('r.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ('CREATED_AT' === $field) {
            $qb->addOrderBy('r.createdAt', $direction);
        }

        return new Paginator($qb);
    }

    public function countForProposal(Proposal $proposal): int
    {
        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
