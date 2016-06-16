<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

/**
 * ProposalRepository.
 */
class ProposalVoteRepository extends EntityRepository
{
    public function getCountsByStepsForProposal(Proposal $proposal)
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
        $counts = [];

        foreach ($results as $result) {
            $counts[$result['selectionStep']] = intval($result['votesCount']);
        }

        foreach ($ids as $id) {
            if (!array_key_exists($id, $counts)) {
                $counts[$id] = 0;
            }
        }

        return $counts;
    }

    public function getVotesForProposal(Proposal $proposal, $limit = null, $offset = 0)
    {
        $qb = $this->createQueryBuilder('pv')
            ->leftJoin('pv.selectionStep', 'ss')
            ->where('pv.proposal = :proposal')
            ->setParameter('proposal', $proposal)
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

    public function getVotesForUserInStep(User $user, SelectionStep $step)
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
