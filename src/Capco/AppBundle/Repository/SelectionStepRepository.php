<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\SelectionStep;

class SelectionStepRepository extends AbstractStepRepository
{
    public function getVotableStepsForProposal(Proposal $proposal)
    {
        $qb = $this->getEnabledQueryBuilder();
        $expr = $qb->expr();
        $qb->leftJoin('ss.projectAbstractStep', 'pas')
            ->where('ss.id in (:ids)')
            ->andWhere($expr->neq('ss.voteType', SelectionStep::VOTE_TYPE_DISABLED))
            ->setParameter('ids', $proposal->getSelectionStepsIds())
            ->orderBy('pas.position')
        ;

        return $qb->getQuery()->getResult();
    }

    public function getVotableStepsForProject(Project $project, bool $asArray = false): iterable
    {
        $qb = $this->getEnabledQueryBuilder();
        $expr = $qb->expr();
        $qb
            ->leftJoin('ss.projectAbstractStep', 'pas')
            ->andWhere($expr->neq('ss.voteType', SelectionStep::$VOTE_TYPE_DISABLED))
            ->andWhere('pas.project = :project')
            ->setParameter('project', $project)
            ->orderBy('pas.position')
        ;

        $query = $qb->getQuery();

        return $asArray ? $query->getArrayResult() : $query->getResult();
    }

    private function getEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('ss')
            ->where('ss.isEnabled = 1')
        ;
    }
}
