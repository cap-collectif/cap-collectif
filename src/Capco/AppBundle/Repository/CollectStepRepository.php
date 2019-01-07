<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Steps\CollectStep;

class CollectStepRepository extends EntityRepository
{
    /**
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneBySlug(string $slug): ?CollectStep
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('proposalForm')
            ->leftJoin('cs.proposalForm', 'proposalForm')
            ->andWhere('cs.slug = :slug')
            ->setParameter('slug', $slug);

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 60)
            ->getOneOrNullResult();
    }

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

        return new Paginator($qb, ($fetchJoin = true));
    }

    public function getCollectStepsForProject(Project $project): array
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('pas')
            ->leftJoin('cs.projectAbstractStep', 'pas')
            ->andWhere('pas.project = :project')
            ->setParameter('project', $project)
            ->orderBy('pas.position', 'ASC');

        return $qb->getQuery()->getResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('cs')
            ->andWhere('cs.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
