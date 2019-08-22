<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\Tools\Pagination\Paginator;

class OpinionVersionRepository extends EntityRepository
{
    use ContributionRepositoryTrait;

    /**
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneBySlugAndProjectSlugAndStepSlugAndOpinionSlug(
        string $slug,
        string $projectSlug,
        string $stepSlug,
        string $opinionSlug
    ): ?OpinionVersion {
        $qb = $this->createQueryBuilder('v')
            ->leftJoin('v.parent', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->andWhere('v.slug = :slug')
            ->andWhere('o.slug = :opinionSlug')
            ->andWhere('s.slug = :stepSlug')
            ->andWhere('p.slug = :projectSlug')
            ->setParameter('slug', $slug)
            ->setParameter('stepSlug', $stepSlug)
            ->setParameter('projectSlug', $projectSlug)
            ->setParameter('opinionSlug', $opinionSlug);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getAllIds()
    {
        $qb = $this->createQueryBuilder('o')->select('o.id');

        return $qb->getQuery()->getArrayResult();
    }

    public function getOne(string $id)
    {
        $qb = $this->getIsEnabledQueryBuilder('o')
            ->addSelect('a', 'm', 'argument', 'source')
            ->leftJoin('o.author', 'a')
            ->leftJoin('a.media', 'm')
            ->leftJoin('o.arguments', 'argument', 'WITH', 'argument.trashedStatus IS NULL')
            ->leftJoin('o.sources', 'source', 'WITH', 'source.trashedStatus IS NULL')
            ->andWhere('o.id = :id')
            ->setParameter('id', $id);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getRecentOrdered()
    {
        $qb = $this->createQueryBuilder('o')
            ->select(
                'o.id',
                'o.title',
                'o.createdAt',
                'o.updatedAt',
                'a.username as author',
                'o.published as published',
                'o.trashedAt as trashed',
                'c.title as project'
            )
            ->leftJoin('o.author', 'a')
            ->leftJoin('o.parent', 'op')
            ->leftJoin('op.consultation', 'opc')
            ->leftJoin('opc.step', 's')
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
                'o.published as published',
                'o.trashedAt as trashed',
                'CONCAT(CONCAT(o.comment, \'<hr>\'), o.body) as body',
                'c.title as project'
            )
            ->leftJoin('o.author', 'a')
            ->leftJoin('o.parent', 'op')
            ->leftJoin('op.consultation', 'opc')
            ->leftJoin('opc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->where('o.id = :id')
            ->setParameter('id', $id);

        return $qb->getQuery()->getOneOrNullResult(Query::HYDRATE_ARRAY);
    }

    /**
     * Get trashed or unpublished versions by project.
     */
    public function getTrashedByProject(Project $project)
    {
        $qb = $this->createQueryBuilder('o')
            ->addSelect('op', 's', 'aut', 'm', 'opc')
            ->leftJoin('o.parent', 'op')
            ->leftJoin('op.OpinionType', 'ot')
            ->leftJoin('o.author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('op.consultation', 'opc')
            ->leftJoin('opc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->andWhere('pas.project = :project')
            ->andWhere('o.trashedAt IS NOT NULL')
            ->setParameter('project', $project)
            ->orderBy('o.trashedAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    public function getByContributionQB(Opinion $opinion)
    {
        return $this->getIsEnabledQueryBuilder()
            ->select('o', '(o.votesCountMitige + o.votesCountOk + o.votesCountNok) as HIDDEN vnb')
            ->andWhere('o.parent = :opinion')
            ->andWhere('o.trashedAt IS NULL')
            ->setParameter('opinion', $opinion);
    }

    public function countByContribution(Opinion $opinion): int
    {
        $qb = $this->getByContributionQB($opinion);
        $qb->select('COUNT(o.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getUnpublishedByContributionAndAuthor(Opinion $opinion, User $author): array
    {
        return $this->createQueryBuilder('o')
            ->andWhere('o.parent = :opinion')
            ->andWhere('o.author = :author')
            ->andWhere('o.published = false')
            ->setParameter('author', $author)
            ->setParameter('opinion', $opinion)
            ->getQuery()
            ->getResult();
    }

    public function getByContribution(
        Opinion $opinion,
        ?int $limit,
        ?int $first,
        string $field,
        string $direction
    ) {
        $qb = $this->getByContributionQB($opinion);

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('o.publishedAt', $direction);
        }

        if ('VOTES' === $field) {
            $qb->addOrderBy('vnb', $direction);
        }

        if ('VOTES_OK' === $field) {
            $qb->addOrderBy('o.votesCountOk', $direction);
        }

        if ('COMMENTS' === $field) {
            $qb->addOrderBy('o.argumentsCount', $direction);
        }

        if ('RANDOM' === $field) {
            $qb->addSelect('RAND() as HIDDEN rand')->addOrderBy('rand');
        }

        $qb->setFirstResult($first)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function getByUser($user)
    {
        return $this->getIsEnabledQueryBuilder('v')
            ->leftJoin('v.author', 'author')
            ->addSelect('author')
            ->leftJoin('author.media', 'm')
            ->addSelect('m')
            ->leftJoin('v.votes', 'votes')
            ->addSelect('votes')
            ->andWhere('v.author = :author')
            ->setParameter('author', $user)
            ->getQuery()
            ->getResult();
    }

    public function countByAuthorAndProject(User $author, Project $project): int
    {
        $qb = $this->getIsEnabledQueryBuilder('version')
            ->select('count(DISTINCT version)')
            ->leftJoin('version.parent', 'opinion')
            ->leftJoin('opinion.consultation', 'oc')
            ->andWhere('oc.step IN (:steps)')
            ->andWhere('version.author = :author')
            ->setParameter(
                'steps',
                array_filter($project->getRealSteps(), static function ($step) {
                    return $step->isConsultationStep();
                })
            )
            ->setParameter('author', $author);

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult();
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        $qb = $this->getIsEnabledQueryBuilder('version')
            ->select('count(DISTINCT version)')
            ->leftJoin('version.parent', 'opinion')
            ->leftJoin('opinion.consultation', 'oc')
            ->andWhere('oc.step = :step')
            ->andWhere('version.author = :author')
            ->setParameter('step', $step)
            ->setParameter('author', $author);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countAllByAuthor(User $user): int
    {
        $qb = $this->createQueryBuilder('version');
        $qb
            ->select('count(DISTINCT version)')
            ->andWhere('version.author = :author')
            ->setParameter('author', $user);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findAllByAuthor(User $user): array
    {
        $qb = $this->createQueryBuilder('version');
        $qb->andWhere('version.author = :author')->setParameter('author', $user);

        return $qb->getQuery()->getResult();
    }

    /**
     * Get all versions in a project.
     *
     * @param string|User|null $excludedAuthor
     */
    public function getEnabledByProject(
        Project $project,
        $excludedAuthor = null,
        bool $orderByRanking = false,
        ?int $limit = null,
        int $page = 1
    ) {
        /*: array|Paginator*/ $qb = $this->getIsEnabledQueryBuilder('ov')
            ->addSelect('o', 'ot', 's', 'aut', 'm', 'oc')
            ->leftJoin('ov.parent', 'o')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('ov.author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->innerJoin('o.consultation', 'oc')
            ->innerJoin('oc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->andWhere('cas.project = :project')
            ->andWhere('ov.trashedAt IS NULL')
            ->setParameter('project', $project);
        if (null !== $excludedAuthor) {
            $qb->andWhere('aut.id != :author')->setParameter('author', $excludedAuthor);
        }

        if ($orderByRanking) {
            $qb
                ->orderBy('ov.ranking', 'ASC')
                ->addOrderBy('ov.votesCountOk', 'DESC')
                ->addOrderBy('ov.votesCountNok', 'ASC')
                ->addOrderBy('ov.updatedAt', 'DESC');
        }

        $qb->addOrderBy('ov.updatedAt', 'DESC');

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
     * Get all versions by project ordered by votesCountOk.
     *
     * @param $project
     * @param null|mixed $excludedAuthor
     *
     * @return mixed
     */
    public function getEnabledByProjectsOrderedByVotes(Project $project, $excludedAuthor = null)
    {
        $qb = $this->getIsEnabledQueryBuilder('ov')
            ->innerJoin('ov.parent', 'o')
            ->innerJoin('o.consultation', 'oc')
            ->innerJoin('oc.step', 's')
            ->innerJoin('s.projectAbstractStep', 'cas')
            ->innerJoin('cas.project', 'c')
            ->andWhere('ov.trashedAt IS NULL')
            ->andWhere('cas.project = :project')
            ->setParameter('project', $project);
        if (null !== $excludedAuthor) {
            $qb
                ->innerJoin('ov.author', 'a')
                ->andWhere('a.id != :author')
                ->setParameter('author', $excludedAuthor);
        }

        $qb->orderBy('ov.votesCountOk', 'DESC');

        return $qb->getQuery()->getResult();
    }

    public function countPublishedOpinionVersionByStep(ConsultationStep $cs): int
    {
        $query = $this->createQueryBuilder('ov');
        $query
            ->select('count(DISTINCT ov.id)')
            ->innerJoin('ov.parent', 'o')
            ->innerJoin('o.consultation', 'oc', 'WITH', 'oc.step = :cs')
            ->andWhere('ov.published = 1')
            ->andWhere('o.trashedAt IS NULL')
            ->setParameter('cs', $cs);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countTrashedOpinionVersionByStep(ConsultationStep $cs): int
    {
        $query = $this->createQueryBuilder('ov');
        $query
            ->select('count(DISTINCT ov.id)')
            ->innerJoin('ov.parent', 'o')
            ->innerJoin('o.consultation', 'oc', 'WITH', 'oc.step = :cs')
            ->andWhere('ov.published = 1')
            ->andWhere('o.trashedAt IS NOT NULL')
            ->setParameter('cs', $cs);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    protected function getIsEnabledQueryBuilder($alias = 'o')
    {
        return $this->createQueryBuilder($alias)->andWhere($alias . '.published = true');
    }
}
