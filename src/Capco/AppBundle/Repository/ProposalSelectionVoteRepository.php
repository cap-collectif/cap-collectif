<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

/**
 * ProposalSelectionVoteRepository.
 */
class ProposalSelectionVoteRepository extends EntityRepository
{
    public function getCountsByProposalGroupedBySteps(Proposal $proposal)
    {
        $ids = array_map(function ($value) {
            return $value->getId();
        }, $proposal->getSelectionSteps());

        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id) as votesCount', 'ss.id as selectionStep')
            ->leftJoin('pv.selectionStep', 'ss')
            ->where('pv.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->groupBy('pv.selectionStep')
        ;
        $results = $qb->getQuery()->getResult();
        $votesBySteps = [];

        foreach ($results as $result) {
            $votesBySteps[$result['selectionStep']] = intval($result['votesCount']);
        }

        foreach ($ids as $id) {
            if (!array_key_exists($id, $votesBySteps)) {
                $votesBySteps[$id] = 0;
            }
        }

        return $votesBySteps;
    }

    public function getVotesForProposalByStepId(Proposal $proposal, $step, $limit = null, $offset = 0)
    {
        $qb = $this->createQueryBuilder('pv')
            ->leftJoin('pv.selectionStep', 'ss')
            ->where('pv.proposal = :proposal')
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

    public function getVotesForUserInProjectGroupedBySteps(User $user, Project $project)
    {
        $qb = $this->createQueryBuilder('pv')
            ->addSelect('p', 'pf', 's')
            ->leftJoin('pv.proposal', 'p')
            ->leftJoin('p.proposalForm', 'pf')
            ->leftJoin('pv.selectionStep', 'ss')
            ->leftJoin('pf.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->where('pv.user = :user')
            ->setParameter('user', $user)
            ->andWhere('pas.project = :project')
            ->setParameter('project', $project)
            ->orderBy('pv.createdAt', 'DESC')
            ->groupBy('ss.id')
        ;

        return $qb->getQuery()->getResult();
    }

    public function countForUserAndStep(User $user, SelectionStep $step)
    {
        $qb = $this->createQueryBuilder('pv')
            ->select('COUNT(pv.id) as votesCount')
            ->where('pv.user = :user')
            ->setParameter('user', $user)
            ->andWhere('pv.selectionStep = :step')
            ->setParameter('step', $step)
        ;

        return intval($qb->getQuery()->getSingleScalarResult());
    }

    public function InCollectStep(User $user, SelectionStep $step)
    {
        $qb = $this->createQueryBuilder('pv')
            ->where('pv.user = :user')
            ->setParameter('user', $user)
            ->andWhere('pv.selectionStep = :step')
            ->setParameter('step', $step)
        ;

        return $qb->getQuery()->getResult();
    }

    public function getVotesCountForSelectionStep(SelectionStep $step, $themeId = null, $districtId = null)
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

        return intval($qb->getQuery()->getSingleScalarResult());
    }
}
