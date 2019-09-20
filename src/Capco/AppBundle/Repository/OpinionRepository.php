<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\Query;
use Doctrine\ORM\QueryBuilder;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Consultation;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;

class OpinionRepository extends EntityRepository
{
    use ContributionRepositoryTrait;

    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('o');
        $qb
            ->addSelect('aut', 'oc', 'oot', 'autm', 'ocs')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('o.OpinionType', 'oot')
            ->leftJoin('aut.media', 'autm')
            ->leftJoin('oc.step', 'ocs')

            ->where('o.id IN (:ids)')
            ->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    public function getRecentOrdered(): array
    {
        $qb = $this->createQueryBuilder('o')
            ->select(
                'o.id',
                'o.title',
                'o.createdAt',
                'o.updatedAt',
                'a.username as author',
                'o.published',
                'o.trashedAt as trashed',
                'c.title as project'
            )
            ->leftJoin('o.Author', 'a')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c');

        return $qb->getQuery()->getArrayResult();
    }

    public function getArrayById(string $id)
    {
        $qb = $this->createQueryBuilder('o')
            ->select(
                'o.id',
                'o.title',
                'o.createdAt',
                'o.updatedAt',
                'a.username as author',
                'o.published',
                'o.trashedAt as trashed',
                'o.body as body',
                'c.title as project'
            )
            ->leftJoin('o.Author', 'a')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->where('o.id = :id')
            ->setParameter('id', $id);

        return $qb->getQuery()->getOneOrNullResult(Query::HYDRATE_ARRAY);
    }

    public function getOne(string $id)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 'ot', 'oc', 'ocs', 'appendix')
            ->leftJoin('o.Author', 'a')
            ->leftJoin('a.media', 'm')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 'ocs')
            ->leftJoin('o.appendices', 'appendix')
            ->andWhere('o.id = :id')
            ->setParameter('id', $id);

        return $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneBySlugAndProjectSlugAndStepSlug(
        string $slug,
        string $projectSlug,
        string $stepSlug
    ): ?Opinion {
        $qb = $this->createQueryBuilder('o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->andWhere('o.slug = :slug')
            ->andWhere('s.slug = :stepSlug')
            ->andWhere('p.slug = :projectSlug')
            ->setParameter('slug', $slug)
            ->setParameter('stepSlug', $stepSlug)
            ->setParameter('projectSlug', $projectSlug);

        return $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * Get all opinions in a project.
     *
     * @param $project
     * @param $excludedAuthor
     * @param $orderByRanking
     * @param $limit
     * @param $page
     *
     * @return mixed
     */
    public function getEnabledByProject(
        $project,
        $excludedAuthor = null,
        $orderByRanking = false,
        $limit = null,
        $page = 1
    ) {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('ot', 'oc', 's', 'aut', 'm')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->andWhere('cas.project = :project')
            ->andWhere('o.trashedAt IS NULL')
            ->setParameter('project', $project);
        if (null !== $excludedAuthor) {
            $qb->andWhere('aut.id != :author')->setParameter('author', $excludedAuthor);
        }

        if ($orderByRanking) {
            $qb
                ->orderBy('o.ranking', 'ASC')
                ->addOrderBy('o.votesCountOk', 'DESC')
                ->addOrderBy('o.votesCountNok', 'ASC')
                ->addOrderBy('o.updatedAt', 'DESC');
        }

        $qb->addOrderBy('o.updatedAt', 'DESC');

        if (null !== $limit && \is_int($limit) && 0 < $limit) {
            $query = $qb
                ->getQuery()
                ->setFirstResult(($page - 1) * $limit)
                ->setMaxResults($limit);

            return new Paginator($query);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Get all trashed or unpublished opinions.
     */
    public function getTrashedByProject(Project $project)
    {
        $qb = $this->createQueryBuilder('o')
            ->addSelect('ot', 'oc', 's', 'aut', 'm', 'oc')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->andWhere('pas.project = :project')
            ->andWhere('o.trashedAt IS NOT NULL')
            ->setParameter('project', $project)
            ->orderBy('o.trashedAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    public function countByAuthorAndProject(User $user, Project $project): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('count(DISTINCT o)')
            ->andWhere('o.Author = :author')
            ->innerJoin('o.consultation', 'oc', 'WITH', 'oc.step IN (:steps)')
            ->setParameter(
                'steps',
                array_filter($project->getRealSteps(), function ($step) {
                    return $step->isConsultationStep();
                })
            )
            ->setParameter('author', $user);

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult();
    }

    public function countByAuthorAndStep(User $user, ConsultationStep $step): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('count(DISTINCT o)')
            ->innerJoin('o.consultation', 'oc', 'WITH', 'oc.step = :step')
            ->andWhere('o.Author = :author')
            ->setParameter('author', $user)
            ->setParameter('step', $step);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByAuthorAndConsultation(User $user, Consultation $consultation): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('count(DISTINCT o)')
            ->andWhere('o.consultation = :consultation')
            ->andWhere('o.Author = :author')
            ->setParameter('author', $user)
            ->setParameter('consultation', $consultation);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countAllByAuthor(User $user): int
    {
        $qb = $this->createQueryBuilder('o');
        $qb
            ->select('count(DISTINCT o)')
            ->andWhere('o.Author = :author')
            ->setParameter('author', $user);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findAllByAuthor(User $user): array
    {
        $qb = $this->createQueryBuilder('o');
        $qb->andWhere('o.Author = :author')->setParameter('author', $user);

        return $qb->getQuery()->getResult();
    }

    public function handleOpinionVisibility(QueryBuilder $qb, ?User $viewer): QueryBuilder
    {
        if (!$viewer) {
            $qb->andWhere(
                $qb->expr()->eq('pro.visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC)
            );
        } elseif (!$viewer->isSuperAdmin()) {
            $qb->setParameter('viewer', $viewer);
            // The call of the function below filters the contributions according to the visibility
            // of the project containing it, as well as the privileges of the connected user.
            $qb = $this->getContributionsViewerCanSee($qb, $viewer);
        }

        return $qb;
    }

    public function getByUser(
        User $user,
        ?User $viewer,
        $limit = 50,
        $offset = 0,
        bool $includeTrashed = false
    ) {
        $qb = $this->getIsEnabledQueryBuilder()
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 'step')
            ->leftJoin('step.projectAbstractStep', 'pAs')
            ->leftJoin('pAs.project', 'pro')
            ->leftJoin('pro.restrictedViewerGroups', 'prvg')
            ->leftJoin('pro.authors', 'pr_au')
            ->andWhere('o.Author = :author')
            ->andWhere('o.published = true')
            ->andWhere('step.isEnabled = true')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->setParameter('author', $user);

        if (!$includeTrashed) {
            $qb->andWhere('o.trashedAt IS NULL');
        }
        $qb = $this->handleOpinionVisibility($qb, $viewer);

        return $qb->getQuery()->getResult();
    }

    public function countByUser(User $user, bool $includeTrashed = false, ?User $viewer = null): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(o.id)')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 'step')
            ->leftJoin('step.projectAbstractStep', 'pAs')
            ->leftJoin('pAs.project', 'pro')
            ->leftJoin('pro.restrictedViewerGroups', 'prvg')
            ->leftJoin('pro.authors', 'pr_au')
            ->andWhere('o.Author = :author')
            ->andWhere('o.published = true')
            ->andWhere('step.isEnabled = true')
            ->setParameter('author', $user);

        if (!$includeTrashed) {
            $qb->andWhere('o.trashedAt IS NULL');
        }

        $qb = $this->handleOpinionVisibility($qb, $viewer);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByOpinionType(
        string $opinionTypeId,
        ?string $author = null,
        bool $includeTrashed = false,
        ?User $viewer = null
    ): int {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(o)')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 'step')
            ->leftJoin('step.projectAbstractStep', 'pAs')
            ->leftJoin('pAs.project', 'pro')
            ->leftJoin('pro.restrictedViewerGroups', 'prvg')
            ->leftJoin('pro.authors', 'pr_au')
            ->andWhere('o.OpinionType = :opinionTypeId')
            ->setParameter('opinionTypeId', $opinionTypeId);

        if ($author) {
            $qb->andWhere('o.Author = :author')->setParameter('author', $author);
        }

        if (!$includeTrashed) {
            $qb->andWhere('o.trashedAt IS NULL');
        }

        $qb = $this->handleOpinionVisibility($qb, $viewer);

        return // ->useResultCache(true, 60)
            $qb
                ->getQuery()
                ->useQueryCache(true)
                ->getSingleScalarResult();
    }

    public function countByStep(AbstractStep $step, bool $includeTrashed = false): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(o)')
            ->innerJoin('o.consultation', 'oc', 'WITH', 'oc.step = :step')
            ->setParameter('step', $step);

        if (!$includeTrashed) {
            $qb->andWhere('o.trashedAt IS NULL');
        }

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult();
    }

    /**
     * Get all opinions by project ordered by votesCountOk.
     *
     * @param $project
     * @param $excludedAuthor
     *
     * @return mixed
     */
    public function getEnabledByProjectsOrderedByVotes(Project $project, $excludedAuthor = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->innerJoin('o.consultation', 'oc')
            ->innerJoin('oc.step', 'ocs')
            ->innerJoin('ocs.projectAbstractStep', 'cas')
            ->innerJoin('cas.project', 'c')
            ->andWhere('o.trashedAt IS NULL')
            ->andWhere('cas.project = :project')
            ->setParameter('project', $project);
        if (null !== $excludedAuthor) {
            $qb
                ->innerJoin('o.Author', 'a')
                ->andWhere('a.id != :author')
                ->setParameter('author', $excludedAuthor);
        }

        $qb->orderBy('o.votesCountOk', 'DESC');

        return $qb->getQuery()->getResult();
    }

    public function getUnpublishedByConsultationAndAuthor(
        Consultation $consultation,
        User $author
    ): array {
        return $this->createQueryBuilder('o')
            ->innerJoin('o.consultation', 'oc', 'WITH', 'oc.step = :step')
            ->andWhere('o.published = false')
            ->andWhere('o.Author = :author')
            ->setParameter('author', $author)
            ->setParameter('step', $consultation->getStep())
            ->getQuery()
            ->getResult();
    }

    public function findFollowingOpinionByUser(
        User $user,
        int $first = 0,
        int $offset = 100
    ): Paginator {
        $query = $this->createQueryBuilder('o')
            ->leftJoin('o.followers', 'f')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 'step')
            ->leftJoin('step.projectAbstractStep', 'project_abstract_step')
            ->leftJoin('project_abstract_step.project', 'project')
            ->andWhere('f.user = :user')
            ->andWhere('f.opinion IS NOT NULL')
            ->andWhere('project.opinionCanBeFollowed = true')
            ->setParameter('user', $user)
            ->setMaxResults($offset)
            ->setFirstResult($first);

        return new Paginator($query);
    }

    public function countFollowingOpinionByUser(User $user): int
    {
        $query = $this->createQueryBuilder('o');
        $query
            ->select('COUNT(o.id)')
            ->leftJoin('o.followers', 'f')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 'step')
            ->leftJoin('step.projectAbstractStep', 'project_abstract_step')
            ->leftJoin('project_abstract_step.project', 'project')
            ->andWhere('f.user = :user')
            ->andWhere('f.opinion IS NOT NULL')
            ->andWhere('project.opinionCanBeFollowed = true')
            ->setParameter('user', $user);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countPublishedContributionsByStep(ConsultationStep $cs): int
    {
        $query = $this->createQueryBuilder('o');
        $query
            ->select('COUNT(o.id)')
            ->innerJoin('o.consultation', 'oc', 'WITH', 'oc.step = :cs')
            ->andWhere('o.published = 1')
            ->andWhere('o.trashedAt IS NULL')
            ->setParameter('cs', $cs);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countPublishedContributionsByConsultation(Consultation $consultation): int
    {
        $query = $this->createQueryBuilder('o');
        $query
            ->select('COUNT(o.id)')
            ->andWhere('o.published = 1')
            ->andWhere('o.consultation = :consultation')
            ->andWhere('o.trashedAt IS NULL')
            ->setParameter('consultation', $consultation);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countTrashedContributionsByStep(ConsultationStep $cs): int
    {
        $query = $this->createQueryBuilder('o');
        $query
            ->select('COUNT(o.id)')
            ->innerJoin('o.consultation', 'oc', 'WITH', 'oc.step = :cs')
            ->andWhere('o.published = 1')
            ->andWhere('o.trashedAt IS NOT NULL')
            ->setParameter('cs', $cs);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countTrashedContributionsByConsultation(Consultation $consultation): int
    {
        $query = $this->createQueryBuilder('o');
        $query
            ->select('COUNT(o.id)')
            ->andWhere('o.published = 1')
            ->andWhere('o.consultation = :consultation')
            ->andWhere('o.trashedAt IS NOT NULL')
            ->setParameter('consultation', $consultation);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    protected function getIsEnabledQueryBuilder($alias = 'o'): QueryBuilder
    {
        return $this->createQueryBuilder($alias)->andWhere($alias . '.published = true');
    }
}
