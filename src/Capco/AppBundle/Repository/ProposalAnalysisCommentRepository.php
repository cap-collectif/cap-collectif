<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ProposalAnalysis;
use Doctrine\ORM\EntityRepository;

class ProposalAnalysisCommentRepository extends EntityRepository
{
    public function countByProposalAnalysis(ProposalAnalysis $proposalAnalysis): int
    {
        $qb = $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->where('c.proposalAnalysis = :proposalAnalysis')
            ->setParameter('proposalAnalysis', $proposalAnalysis)
        ;

        return $qb->getQuery()->getSingleScalarResult() ?? 0;
    }
}
