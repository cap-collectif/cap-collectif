<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

/**
 * ProposalCollectVoteRepository.
 */
class ProposalCollectVoteRepository extends EntityRepository
{
    public function getAnonymousCount(): int
    {
        $qb = $this->createQueryBuilder('v')
        ->select('count(DISTINCT v.email)')
        ->where('v.user IS NULL')
    ;

        return $qb->getQuery()
        ->getSingleScalarResult()
        ;
    }

    public function getVotesByStepAndUser(CollectStep $step, User $user)
    {
        return $this->createQueryBuilder('pv')
          ->select('pv', 'proposal')
          ->andWhere('pv.collectStep = :step')
          ->andWhere('pv.user = :user')
          ->andWhere('pv.expired = 0')
          ->leftJoin('pv.proposal', 'proposal')
          ->andWhere('proposal.id IS NOT NULL')
          ->andWhere('proposal.deletedAt IS NULL')
          ->setParameter('user', $user)
          ->setParameter('step', $step)
          ->getQuery()
          ->getResult()
        ;
    }

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
              ->andWhere('proposal.deletedAt IS NULL')
              ->setParameter('user', $user)
              ->setParameter('id', $id)
              ;
                $results = $qb->getQuery()->getScalarResult();
                $userVotes[$id] = array_map(function ($id) {
                    return (int) $id;
                }, array_column($results, 'id'));
            }
        }

        foreach ($collectStepsIds as $id) {
            if (!array_key_exists($id, $userVotes)) {
                $userVotes[$id] = [];
            }
        }

        return $userVotes;
    }

    public function countVotesByStepAndUser(CollectStep $step, User $user)
    {
        return $this->createQueryBuilder('pv')
          ->select('COUNT(pv.id)')
          ->andWhere('pv.expired = 0')
          ->andWhere('pv.collectStep = :collectStep')
          ->andWhere('pv.user = :user')
          ->setParameter('collectStep', $step)
          ->setParameter('user', $user)
          ->getQuery()
          ->getSingleScalarResult()
      ;
    }

    public function getCountsByProposalGroupedBySteps(Proposal $proposal)
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id) as votesCount', 'cs.title as step')
            ->leftJoin('pv.collectStep', 'cs')
            ->andWhere('pv.proposal = :proposal')
            ->andWhere('pv.expired = false')
            ->setParameter('proposal', $proposal)
            ->groupBy('pv.collectStep')
        ;
        $results = $qb->getQuery()->getResult();
        $votesBySteps = [];

        foreach ($results as $result) {
            $votesBySteps[$result['step']] = (int) ($result['votesCount']);
        }

        $title = $proposal->getProposalForm()->getStep()->getTitle();
        if (!array_key_exists($title, $votesBySteps)) {
            $votesBySteps[$title] = 0;
        }

        return $votesBySteps;
    }

    public function getVotesForProposalByStepId(Proposal $proposal, $step, $limit = null, $offset = 0)
    {
        $qb = $this->createQueryBuilder('pv')
            ->leftJoin('pv.collectStep', 'cs')
            ->where('pv.proposal = :proposal')
            ->andWhere('pv.expired = false')
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

        return (int) ($qb->getQuery()->getSingleScalarResult());
    }
}
