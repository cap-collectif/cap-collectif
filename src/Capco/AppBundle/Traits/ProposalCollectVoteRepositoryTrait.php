<?php
namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Steps\CollectStep;

trait ProposalCollectVoteRepositoryTrait {

    public function countPublishedCollectVoteByStep(
        CollectStep $step,
        bool $onlyAccounted
    ): int {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(DISTINCT pv.id)')
            ->andWhere('pv.collectStep = :step')
            ->innerJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('pv.published = 1');

        if ($onlyAccounted) {
            $qb->andWhere('pv.isAccounted = 1');
        }

        return $qb
            ->andWhere('pv.isAccounted = 1')
            ->andWhere('proposal.draft = 0')
            ->andWhere('proposal.trashedAt IS NULL')
            ->andWhere('proposal.published = 1')
            ->setParameter('step', $step)
            ->getQuery()
            ->getSingleScalarResult();
    }


}