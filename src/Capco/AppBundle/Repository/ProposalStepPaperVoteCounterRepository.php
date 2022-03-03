<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProposalStepPaperVoteCounter;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

/**
 * @method ProposalStepPaperVoteCounter|null find($id, $lockMode = null, $lockVersion = null)
 * @method ProposalStepPaperVoteCounter|null findOneBy(array $criteria, array $orderBy = null)
 * @method ProposalStepPaperVoteCounter[]    findAll()
 * @method ProposalStepPaperVoteCounter[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ProposalStepPaperVoteCounterRepository extends EntityRepository
{
    public function countVotesByProject(Project $project): int
    {
        $qb = $this->createByProjectQueryBuilder($project)->select('SUM(pspvc.totalCount)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function countPointsByProject(Project $project): int
    {
        $qb = $this->createByProjectQueryBuilder($project)->select('SUM(pspvc.totalPointsCount)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    private function createByProjectQueryBuilder(Project $project): QueryBuilder
    {
        return $this->createQueryBuilder('pspvc')
            ->leftJoin('pspvc.step', 'step')
            ->leftJoin('step.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'project')
            ->andWhere('pas.project = :project')
            ->setParameter('project', $project);
    }
}
