<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Doctrine\Common\Collections\Criteria;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

class AbstractStepRepository extends EntityRepository
{
    public static function createOrderedByCritera(array $orderings): Criteria
    {
        return Criteria::create()->orderBy($orderings);
    }

    public static function createSlugCriteria(string $slug): Criteria
    {
        return Criteria::create()->andWhere(Criteria::expr()->eq('slug', $slug));
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
            ->setParameter('projectSlug', $projectSlug)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getByIdWithCache(string $id): ?AbstractStep
    {
        $qb = $this->createQueryBuilder('s')
            ->andWhere('s.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 60)
            ->getOneOrNullResult()
        ;
    }

    public function getByProjectSlug(string $slug): array
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('p', 'pas')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->andWhere('p.slug = :project')
            ->setParameter('project', $slug)
            ->addOrderBy('pas.position', 'ASC')
        ;

        return $qb->getQuery()->execute();
    }

    public function getStepEndingBetween(\DateTimeInterface $before, \DateTimeInterface $after): array
    {
        return $this->getIsEnabledQueryBuilder()
            ->andWhere('s.endAt IS NOT NULL')
            ->andWhere('s.endAt BETWEEN :before AND :after')
            ->setParameter('before', $before)
            ->setParameter('after', $after)
            ->getQuery()
            ->execute()
        ;
    }

    public function findOneByProjectAndStepTitle(Project $project, string $stepTitle): AbstractStep
    {
        $qb = $this->createQueryBuilder('asStep')
            ->join('asStep.projectAbstractStep', 'paStep')
            ->where('asStep.title = :title')
            ->andWhere('paStep.project = :project')
            ->setParameter('project', $project)
            ->setParameter('title', $stepTitle)
        ;

        return $qb->getQuery()->getSingleResult();
    }

    public function getPaginator($limit, $offset): Paginator
    {
        $qb = $this->createQueryBuilder('s');

        $qb->setMaxResults($limit)->setFirstResult($offset);

        return new Paginator($qb);
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true)
        ;
    }
}
