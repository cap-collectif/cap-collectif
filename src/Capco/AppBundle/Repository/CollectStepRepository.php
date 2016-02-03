<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * CollectStepRepository.
 */
class CollectStepRepository extends EntityRepository
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
            ->addOrderBy('p.publishedAt', 'DESC');

        $qb->setMaxResults($limit);
        $qb->setFirstResult($offset);

        return new Paginator($qb, $fetchJoin = true);
    }

    /**
     * Get all collect steps for project.
     *
     * @param Project $project
     *
     * @return array
     */
    public function getCollectStepsForProject(Project $project)
    {
        $qb = $this
            ->getIsEnabledQueryBuilder()
            ->addSelect('pas')
            ->leftJoin('cs.projectAbstractStep', 'pas')
            ->andWhere('pas.project = :project')
            ->setParameter('project', $project)
            ->orderBy('pas.position', 'ASC')
        ;

        return $qb->getQuery()->getResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('cs')
            ->andWhere('cs.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
