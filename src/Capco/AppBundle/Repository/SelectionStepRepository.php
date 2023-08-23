<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\VoteType;

class SelectionStepRepository extends AbstractStepRepository
{
    public function getVotableStepsForProject(Project $project, bool $asArray = false): iterable
    {
        $qb = $this->getEnabledQueryBuilder();
        $expr = $qb->expr();
        $qb->leftJoin('ss.projectAbstractStep', 'pas')
            ->andWhere($expr->neq('ss.voteType', VoteType::DISABLED))
            ->andWhere('pas.project = :project')
            ->setParameter('project', $project)
            ->orderBy('pas.position')
        ;

        $query = $qb->getQuery();

        return $asArray ? $query->getArrayResult() : $query->getResult();
    }

    public function findProposalArchivableSteps(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->where('s.proposalArchivedTime > 0')
            ->andWhere('s.voteThreshold > 0')
        ;

        return $qb->getQuery()->getResult();
    }

    private function getEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('ss')->where('ss.isEnabled = 1');
    }
}
