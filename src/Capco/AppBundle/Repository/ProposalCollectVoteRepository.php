<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Doctrine\ORM\EntityRepository;

/**
 * ProposalCollectVoteRepository.
 */
class ProposalCollectVoteRepository extends EntityRepository
{
    public function getCountsByProposalGroupedBySteps(Proposal $proposal)
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id) as votesCount', 'cs.id as collectStep')
            ->leftJoin('pv.collectStep', 'cs')
            ->where('pv.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->groupBy('pv.collectStep')
        ;
        $results = $qb->getQuery()->getResult();
        $votesBySteps = [];

        foreach ($results as $result) {
            $votesBySteps[$result['collectStep']] = intval($result['votesCount']);
        }

        return $votesBySteps;
    }

    public function getVotesForProposalByStepId(Proposal $proposal, $step, $limit = null, $offset = 0)
    {
        $qb = $this->createQueryBuilder('pv')
            ->leftJoin('pv.collectStep', 'cs')
            ->where('pv.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->andWhere('cs.id = :step')
            ->setParameter('step', $step)
            ->addOrderBy('pv.createdAt', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->getResult();
    }

    public function getVotesCountForCollectStep(CollectStep $step, $themeId = null, $districtId = null)
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->leftJoin('pv.proposal', 'p')
            ->andWhere('pv.collectStep = :step')
            ->setParameter('step', $step)
        ;

        if ($themeId) {
            $qb
                ->leftJoin('p.theme', 't')
                ->andWhere('t.id = :themeId')
                ->setParameter('themeId', $themeId)
            ;
        }

        if ($districtId) {
            $qb
                ->leftJoin('p.district', 'd')
                ->andWhere('d.id = :districtId')
                ->setParameter('districtId', $districtId)
            ;
        }

        return intval($qb->getQuery()->getSingleScalarResult());
    }
}
