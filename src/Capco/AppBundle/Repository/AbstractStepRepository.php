<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
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

    public function findOneByProjectAndStepLabel(Project $project, string $stepLabel): AbstractStep
    {
        $qb = $this->createQueryBuilder('asStep')
            ->join('asStep.projectAbstractStep', 'paStep')
            ->where('asStep.label = :label')
            ->andWhere('paStep.project = :project')
            ->setParameter('project', $project)
            ->setParameter('label', $stepLabel)
        ;

        return $qb->getQuery()->getSingleResult();
    }

    public function getPaginator($limit, $offset): Paginator
    {
        $qb = $this->createQueryBuilder('s');

        $qb->setMaxResults($limit)->setFirstResult($offset);

        return new Paginator($qb);
    }

    /**
     * @return array<AbstractStep>
     */
    public function findAllExceptDebateQuestionnaire(): array
    {
        return $this->createQueryBuilder('s')
            ->where('s NOT INSTANCE OF :debateStep')
            ->andWhere('s NOT INSTANCE OF :questionnaireStep')
            ->setParameter('debateStep', $this->_em->getClassMetadata(DebateStep::class))
            ->setParameter('questionnaireStep', $this->_em->getClassMetadata(QuestionnaireStep::class))
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * @return AbstractStep[]
     */
    public function getAllStepsByCollectStep(): array
    {
        $qb = $this->getIsEnabledQueryBuilder();
        $qb->andWhere($qb->expr()->isInstanceOf('cs', CollectStep::class));

        return $qb->getQuery()->execute();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true)
        ;
    }
}
