<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Doctrine\ORM\EntityRepository;
use Capco\UserBundle\Entity\User;

/**
 * ProposalCollectVoteRepository.
 */
class ProposalCollectVoteRepository extends EntityRepository
{
  public function getUserVotesGroupedByStepIds(array $collectStepsIds, User $user = null): array
  {
        $userVotes = [];
        if ($user) {
          foreach ($collectStepsIds as $id) {
            $qb = $this->createQueryBuilder('pv')
              ->select('proposal.id')
              ->andWhere('pv.collectStep = :id')
              ->andWhere('pv.user = :user')
              ->leftJoin('pv.proposal', 'proposal')
              ->setParameter('user', $user)
              ->setParameter('id', $id)
              ;
            $results = $qb->getQuery()->getScalarResult();
            $userVotes[$id] = array_column($results, 'id');
          }
        }

        foreach ($collectStepsIds as $id) {
          if (!array_key_exists($id, $userVotes)) {
            $userVotes[$id] = [];
          }
        }

        return $userVotes;
    }

    public function getCountsByProposalGroupedBySteps(Proposal $proposal)
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id) as votesCount', 'cs.id as stepId')
            ->leftJoin('pv.collectStep', 'cs')
            ->andWhere('pv.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->groupBy('pv.collectStep')
        ;
        $results = $qb->getQuery()->getResult();
        $votesBySteps = [];

        foreach ($results as $result) {
            $votesBySteps[$result['stepId']] = intval($result['votesCount']);
        }

        $id = $proposal->getProposalForm()->getStep()->getId();
        if (!array_key_exists($id, $votesBySteps)) {
          $votesBySteps[$id] = 0;
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
