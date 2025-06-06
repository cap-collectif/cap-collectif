<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Doctrine\ORM\Tools\Pagination\Paginator;

class CollectStepRepository extends AbstractStepRepository
{
    /**
     * Get last enabled collect steps.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return Paginator
     */
    public function getLastEnabled($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('pas', 'p')
            ->leftJoin('cs.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->addOrderBy('p.publishedAt', 'DESC')
        ;

        $qb->setMaxResults($limit);
        $qb->setFirstResult($offset);

        return new Paginator($qb, ($fetchJoin = true));
    }

    public function getCollectStepsForProject(Project $project): array
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('pas')
            ->leftJoin('cs.projectAbstractStep', 'pas')
            ->andWhere('pas.project = :project')
            ->setParameter('project', $project)
            ->orderBy('pas.position', 'ASC')
        ;

        return $qb->getQuery()->getResult();
    }

    /**
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneBySlugAndProjectSlug(string $slug, string $projectSlug): ?CollectStep
    {
        return parent::getOneBySlugAndProjectSlug($slug, $projectSlug);
    }

    public function findProposalArchivableSteps(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->where('s.proposalArchivedTime > 0')
            ->andWhere('s.voteThreshold > 0')
        ;

        return $qb->getQuery()->getResult();
    }

    /**
     * @return array<CollectStep>
     */
    public function findByEnabledImapConfig(): array
    {
        return $this->createQueryBuilder('s')
            ->join('s.collectStepImapServerConfig', 'csi')
            ->andWhere('s.isCollectByEmailEnabled = true')
            ->getQuery()
            ->getResult()
        ;
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('cs')
            ->andWhere('cs.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true)
        ;
    }
}
