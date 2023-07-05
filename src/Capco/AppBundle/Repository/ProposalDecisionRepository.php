<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Enum\ProposalStatementState;
use Doctrine\ORM\EntityRepository;

class ProposalDecisionRepository extends EntityRepository
{
    public function findUserProcessedProposalByIds(array $ids): iterable
    {
        return $this->createQueryBuilder('pd')
            ->leftJoin('pd.proposal', 'p')
            ->andWhere('p.id IN (:ids)')
            ->andWhere('pd.state = :state')
            ->setParameter('ids', $ids)
            ->setParameter('state', ProposalStatementState::DONE)
            ->getQuery()
            ->getResult()
        ;
    }
}
