<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Traits\AnonymousVoteRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

/**
 * ProposalSelectionVoteRepository.
 */
class ProposalSelectionVoteRepository extends EntityRepository
{
    use AnonymousVoteRepositoryTrait;

    public function getVotesByStepAndUser(SelectionStep $step, User $user)
    {
        return $this->createQueryBuilder('pv')
          ->select('pv', 'proposal')
          ->andWhere('pv.selectionStep = :step')
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

    public function getUserVotesGroupedByStepIds(array $selectionStepsIds, User $user = null): array
    {
        $userVotes = [];
        if ($user) {
            foreach ($selectionStepsIds as $id) {
                $qb = $this->createQueryBuilder('pv')
              ->select('proposal.id')
              ->andWhere('pv.selectionStep = :id')
              ->andWhere('pv.user = :user')
              ->andWhere('pv.expired = 0')
              ->leftJoin('pv.proposal', 'proposal')
              ->andWhere('proposal.deletedAt IS NULL')
              ->setParameter('user', $user)
              ->setParameter('id', $id)
              ;
                $results = $qb->getQuery()->getScalarResult();
                $userVotes[$id] = array_map(function ($id) {
                    return $id;
                }, array_column($results, 'id'));
            }
        }

        foreach ($selectionStepsIds as $id) {
            if (!array_key_exists($id, $userVotes)) {
                $userVotes[$id] = [];
            }
        }

        return $userVotes;
    }

    public function countVotesByStepAndUser(SelectionStep $step, User $user): int
    {
        return $this->createQueryBuilder('pv')
          ->select('COUNT(pv.id)')
          ->andWhere('pv.selectionStep = :selectionStep')
          ->andWhere('pv.user = :user')
          ->andWhere('pv.expired = 0')
          ->setParameter('selectionStep', $step)
          ->setParameter('user', $user)
          ->getQuery()
          ->getSingleScalarResult()
      ;
    }

    public function getCountsByProposalGroupedBySteps(Proposal $proposal): array
    {
        $ids = array_map(function ($value) {
            return $value->getId();
        }, $proposal->getSelectionSteps());

        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id) as votesCount', 'ss.id as selectionStep')
            ->leftJoin('pv.selectionStep', 'ss')
            ->andWhere('pv.proposal = :proposal')
            ->andWhere('pv.expired = false')
            ->setParameter('proposal', $proposal)
            ->groupBy('pv.selectionStep')
        ;
        $results = $qb->getQuery()->getResult();
        $votesBySteps = [];

        foreach ($results as $result) {
            $votesBySteps[$result['selectionStep']] = (int) $result['votesCount'];
        }

        foreach ($ids as $id) {
            if (!array_key_exists($id, $votesBySteps)) {
                $votesBySteps[$id] = 0;
            }
        }

        return $votesBySteps;
    }

    public function getVotesForProposalByStepId(Proposal $proposal, SelectionStep $step, $limit = null, $offset = 0)
    {
        $qb = $this->createQueryBuilder('pv')
            ->leftJoin('pv.selectionStep', 'ss')
            ->where('pv.proposal = :proposal')
            ->andWhere('pv.expired = false')
            ->setParameter('proposal', $proposal)
            ->andWhere('ss.id = :step')
            ->setParameter('step', $step)
            ->addOrderBy('pv.createdAt', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->getResult();
    }

    // public function getVotesForUserInProjectGroupedBySteps(User $user, Project $project)
    // {
    //     $qb = $this->createQueryBuilder('pv')
    //         ->addSelect('p', 'pf', 's')
    //         ->leftJoin('pv.proposal', 'p')
    //         ->leftJoin('p.proposalForm', 'pf')
    //         ->leftJoin('pv.selectionStep', 'ss')
    //         ->leftJoin('pf.step', 's')
    //         ->leftJoin('s.projectAbstractStep', 'pas')
    //         ->where('pv.user = :user')
    //         ->setParameter('user', $user)
    //         ->andWhere('pas.project = :project')
    //         ->setParameter('project', $project)
    //         ->orderBy('pv.createdAt', 'DESC')
    //         ->groupBy('ss.id')
    //     ;

    //     return $qb->getQuery()->getResult();
    // }

    // public function countForUserAndStep(User $user, SelectionStep $step)
    // {
    //     $qb = $this->createQueryBuilder('pv')
    //         ->select('COUNT(pv.id) as votesCount')
    //         ->where('pv.user = :user')
    //         ->setParameter('user', $user)
    //         ->andWhere('pv.selectionStep = :step')
    //         ->setParameter('step', $step)
    //     ;

    //     return intval($qb->getQuery()->getSingleScalarResult());
    // }

    // public function InCollectStep(User $user, SelectionStep $step)
    // {
    //     $qb = $this->createQueryBuilder('pv')
    //         ->where('pv.user = :user')
    //         ->setParameter('user', $user)
    //         ->andWhere('pv.selectionStep = :step')
    //         ->setParameter('step', $step)
    //     ;

    //     return $qb->getQuery()->getResult();
    // }

    public function getVotesCountForSelectionStep(SelectionStep $step, $themeId = null, $districtId = null, $categoryId = null)
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id)')
            ->leftJoin('pv.proposal', 'p')
            ->andWhere('pv.selectionStep = :step')
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

        if ($categoryId) {
            $qb
                ->leftJoin('p.category', 'category')
                ->andWhere('category.id = :categoryId')
                ->setParameter('categoryId', $categoryId)
            ;
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
