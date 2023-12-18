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

    public function findProjectMediatorsProposalsVotes(string $projectId): array
    {
        $sql = "
            SELECT v.id, v.proposal_id, p.title, p.reference
            FROM votes v
            JOIN project_abstractstep pas on v.selection_step_id = pas.step_id
            JOIN proposal p on v.proposal_id = p.id
            WHERE v.mediator_id is not null and pas.project_id = \"{$projectId}\"
        ";

        return $this->getEntityManager()
            ->getConnection()
            ->executeQuery($sql)
            ->fetchAllAssociative()
        ;
    }

    private function getEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('ss')->where('ss.isEnabled = 1');
    }
}
