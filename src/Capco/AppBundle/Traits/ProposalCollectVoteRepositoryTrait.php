<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Steps\CollectStep;

trait ProposalCollectVoteRepositoryTrait
{
    /** @return int */
    public function countPublishedCollectVoteByStep(
        CollectStep $step,
        bool $onlyAccounted,
    ): int {
        $qb = $this->createQueryBuilder('pv')
            ->andWhere('pv.collectStep = :step')
            ->innerJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('pv.published = 1')
            ->andWhere('proposal.draft = 0')
            ->andWhere('proposal.trashedAt IS NULL')
            ->andWhere('proposal.published = 1')
            ->setParameter('step', $step)
    ;

        if ($onlyAccounted) {
            $qb->andWhere('pv.isAccounted = 1');
        }

        $qb->select('COUNT(DISTINCT pv.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /** @return array<int, int> */
    public function getPublishedCollectVoteByStep(
        CollectStep $step,
        bool $onlyAccounted,
    ): array {
        $qb = $this->createQueryBuilder('pv')
            ->andWhere('pv.collectStep = :step')
            ->innerJoin('pv.proposal', 'proposal')
            ->andWhere('proposal.deletedAt IS NULL')
            ->andWhere('pv.published = 1')
            ->andWhere('proposal.draft = 0')
            ->andWhere('proposal.trashedAt IS NULL')
            ->andWhere('proposal.published = 1')
            ->setParameter('step', $step)
        ;

        if ($onlyAccounted) {
            $qb->andWhere('pv.isAccounted = 1');
        }

        $qb->select('DISTINCT pv.id');

        return array_map(fn ($row) => (int) $row['id'], $qb->getQuery()->getResult());
    }
}
