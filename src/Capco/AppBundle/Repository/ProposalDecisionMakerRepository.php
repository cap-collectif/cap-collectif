<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ProposalDecisionMaker;
use Doctrine\ORM\EntityRepository;

/**
 * @method findByProposal(\Capco\AppBundle\Entity\Proposal $proposal)
 * @method findByDecisionMaker(\Capco\UserBundle\Entity\User $decisionMaker)
 */
class ProposalDecisionMakerRepository extends EntityRepository
{
    public function findByProposalIds(array $proposalIds = []): array
    {
        return $this->createQueryBuilder('pdm')
            ->andWhere('pdm.proposal IN (:proposals)')
            ->setParameter('proposals', $proposalIds)
            ->getQuery()
            ->getResult();
    }

    public function deleteByProposals(array $proposals)
    {
        return $this->createQueryBuilder('pdm')
            ->delete(ProposalDecisionMaker::class, 'proposalDecisionMaker')
            ->andWhere('proposalDecisionMaker.proposal IN (:proposals)')
            ->setParameter(':proposals', $proposals)
            ->getQuery()
            ->getResult();
    }
}
