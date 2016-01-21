<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

/**
 * ProposalRepository.
 */
class ProposalVoteRepository extends EntityRepository
{
    public function getCountsByStepsForProposal(Proposal $proposal)
    {
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

    public function getVotesForUserInProject(User $user, Project $project)
    {
        $qb = $this->createQueryBuilder('pv')
            ->addSelect('p', 'pf', 's')
            ->leftJoin('pv.proposal', 'p')
            ->leftJoin('p.proposalForm', 'pf')
            ->leftJoin('pf.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->where('pv.user = :user')
            ->setParameter('user', $user)
            ->andWhere('pas.project = :project')
            ->setParameter('project', $project)
            ->addOrderBy('pv.createdAt', 'DESC')
        ;
        return $qb->getQuery()->getResult();

    }
}
