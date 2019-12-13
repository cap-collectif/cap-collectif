<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Doctrine\Common\Collections\Criteria;
use Doctrine\ORM\EntityRepository;

class AbstractStepRepository extends EntityRepository
{
    public static function createOrderedByCritera(array $orderings): Criteria
    {
        return Criteria::create()->orderBy($orderings);
    }

    /**
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneBySlugAndProjectSlug(string $slug, string $projectSlug): ?AbstractStep
    {
        $qb = $this->createQueryBuilder('s')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->andWhere('s.slug = :slug')
            ->andWhere('p.slug = :projectSlug')
            ->setParameter('slug', $slug)
            ->setParameter('projectSlug', $projectSlug);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getByIdWithCache(string $id): ?AbstractStep
    {
        $qb = $this->createQueryBuilder('s')
            ->andWhere('s.id = :id')
            ->setParameter('id', $id);

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 60)
            ->getOneOrNullResult();
    }

    public function getByProjectSlug(string $slug): array
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('p', 'pas')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->andWhere('p.slug = :project')
            ->setParameter('project', $slug)
            ->addOrderBy('pas.position', 'ASC');

        return $qb->getQuery()->execute();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
