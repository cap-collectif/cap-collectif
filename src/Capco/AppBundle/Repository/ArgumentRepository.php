<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Traits\LocaleRepositoryTrait;
use Doctrine\ORM\Query;
use Doctrine\ORM\QueryBuilder;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\OpinionVersion;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;

class ArgumentRepository extends EntityRepository
{
    use ContributionRepositoryTrait;
    use LocaleRepositoryTrait;

    public function getRecentOrdered(?string $locale = null)
    {
        $locale = $this->getLocale($locale);
        $qb = $this->createQueryBuilder('a')
            ->select(
                'a.id',
                'a.createdAt',
                'a.updatedAt',
                'aut.username as author',
                'utt.name as userType',
                'a.published as published',
                'a.trashedAt as trashed',
                'c.title as project'
            )
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('aut.userType', 'ut')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->leftJoin('ut.translations', 'utt')
            ->where('utt.locale = :locale')
            ->setParameter('locale', $locale);

        return $qb->getQuery()->getArrayResult();
    }

    public function getArrayById(string $id)
    {
        $qb = $this->createQueryBuilder('a')
            ->select(
                'a.id',
                'a.createdAt',
                'a.updatedAt',
                'aut.username as author',
                'a.published as published',
                'a.trashedAt as trashed',
                'a.body as body',
                'c.title as project'
            )
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->where('a.id = :id')
            ->setParameter('id', $id);

        return $qb->getQuery()->getOneOrNullResult(Query::HYDRATE_ARRAY);
    }

    public function getUnpublishedByContributionAndTypeAndAuthor(
        Argumentable $contribution,
        int $type = null,
        User $author
    ): array {
        $qb = $this->createQueryBuilder('a')
            ->andWhere('a.published = false')
            ->andWhere('a.Author = :author')
            ->setParameter('author', $author);
        if (null !== $type) {
            $qb->andWhere('a.type = :type')->setParameter('type', $type);
        }
        if ($contribution instanceof Opinion) {
            $qb->andWhere('a.opinion = :opinion')->setParameter('opinion', $contribution);
        }
        if ($contribution instanceof OpinionVersion) {
            $qb
                ->andWhere('a.opinionVersion = :opinionVersion')
                ->setParameter('opinionVersion', $contribution);
        }

        return $qb->getQuery()->getResult();
    }

    public function getByContributionAndType(
        Argumentable $contribution,
        ?int $type,
        ?int $limit,
        ?int $first,
        string $field,
        string $direction,
        bool $includeTrashed = false
    ): Paginator {
        $qb = $this->getByContributionQB($contribution, $includeTrashed);

        if (null !== $type) {
            $qb->andWhere('a.type = :type')->setParameter('type', $type);
        }

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('a.createdAt', $direction);
        }

        if ('VOTES' === $field) {
            $qb->addOrderBy('a.votesCount', $direction);
        }

        if ($first) {
            $qb->setFirstResult($first);
        }

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return new Paginator($qb);
    }

    public function countByContributionAndType(
        Argumentable $contribution,
        ?int $type = null,
        bool $includeTrashed = false
    ): int {
        $qb = $this->getByContributionQB($contribution, $includeTrashed);
        $qb->select('COUNT(a.id)');

        if (null !== $type) {
            $qb->andWhere('a.type = :type')->setParameter('type', $type);
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Get all trashed or unpublished arguments for project.
     */
    public function getTrashedByProject(Project $project)
    {
        return $this->createQueryBuilder('a')
            ->addSelect('o', 'ov', 'v', 'aut', 'm', 'ovoc', 'ovo')
            ->leftJoin('a.votes', 'v')
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('a.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->leftJoin('oc.step', 'os')
            ->leftJoin('ovoc.step', 'ovos')
            ->leftJoin('ovos.projectAbstractStep', 'ovopas')
            ->leftJoin('os.projectAbstractStep', 'opas')
            ->andWhere('opas.project = :project OR ovopas.project = :project')
            ->andWhere('a.trashedAt IS NOT NULL')
            ->setParameter('project', $project)
            ->orderBy('a.trashedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function countAllByAuthor(User $user): int
    {
        $qb = $this->createQueryBuilder('version');
        $qb
            ->select('count(DISTINCT version)')
            ->andWhere('version.Author = :author')
            ->setParameter('author', $user);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findAllByAuthor(User $user): array
    {
        $qb = $this->createQueryBuilder('version');
        $qb->andWhere('version.Author = :author')->setParameter('author', $user);

        return $qb->getQuery()->getResult();
    }

    /**
     * Count all arguments by user by taking in account the viewer visibility.
     */
    public function countByUser(User $user, ?User $viewer = null): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(a) as TotalArguments')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 'step')
            ->leftJoin('step.projectAbstractStep', 'pAs')
            ->leftJoin('pAs.project', 'pro')
            ->leftJoin('pro.restrictedViewerGroups', 'prvg')
            ->leftJoin('pro.authors', 'pr_au')
            ->andWhere('a.Author = :author')
            ->andWhere('o.published = true')
            ->andWhere('step.isEnabled = true')
            ->andWhere('a.trashedStatus <> :status OR a.trashedStatus IS NULL')
            ->setParameter('status', Trashable::STATUS_INVISIBLE)
            ->setParameter('author', $user);

        $qb = $this->handleArgumentVisibility($qb, $viewer);

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Count all arguments by user.
     */
    public function countAllByUser(User $user): int
    {
        $qb = $this->getIsEnabledQueryBuilder();

        $qb = $qb
            ->select('COUNT(a.id)')
            ->leftJoin('a.opinionVersion', 'ov')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->leftJoin('oc.step', 'cs')
            ->leftJoin('ovoc.step', 'ovocs')
            ->andWhere(
                $qb
                    ->expr()
                    ->andX(
                        'a.Author = :u AND a.published = 1',
                        $qb
                            ->expr()
                            ->andX(
                                $qb
                                    ->expr()
                                    ->orX(
                                        'oc.step = cs AND a.opinion IS NOT NULL AND o.published = 1 AND cs.isEnabled = 1',
                                        'ovoc.step = ovocs AND a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovocs.isEnabled = 1'
                                    )
                            )
                    )
            )
            ->setParameter('u', $user)
            ->getQuery();

        return $qb->getSingleScalarResult() ?? 0;
    }

    public function countByAuthorAndProject(User $author, Project $project): int
    {
        return $this->getIsEnabledQueryBuilder()
            ->select('COUNT(DISTINCT a)')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('a.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->andWhere('a.Author = :author')
            ->andWhere('oc.step IN (:steps) OR ovoc.step IN (:steps)')
            ->setParameter(
                'steps',
                array_filter($project->getRealSteps(), function ($step) {
                    return $step->isConsultationStep();
                })
            )
            ->setParameter('author', $author)
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult();
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        return $this->getIsEnabledQueryBuilder()
            ->select('COUNT(DISTINCT a)')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('a.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->andWhere('oc.step = :step OR ovoc.step = :step')
            ->andWhere('a.Author = :author')
            ->setParameter('step', $step)
            ->setParameter('author', $author)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countByAuthorAndConsultation(User $author, Consultation $consultation): int
    {
        return $this->getIsEnabledQueryBuilder()
            ->select('COUNT(DISTINCT a)')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('a.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere('o.consultation = :consultation OR ovo.consultation = :consultation')
            ->andWhere('a.Author = :author')
            ->setParameter('consultation', $consultation)
            ->setParameter('author', $author)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Get all arguments by user.
     */
    public function getByUser(
        User $user,
        ?User $viewer = null,
        int $first = 0,
        int $offset = 100
    ): array {
        $qb = $this->getIsEnabledQueryBuilder();
        $qb
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 'step')
            ->leftJoin('step.projectAbstractStep', 'pAs')
            ->leftJoin('pAs.project', 'pro')
            ->leftJoin('pro.restrictedViewerGroups', 'prvg')
            ->leftJoin('pro.authors', 'pr_au')
            ->andWhere('a.Author = :author')
            ->andWhere('a.trashedStatus <> :status OR a.trashedStatus IS NULL')
            ->setParameter('author', $user)
            ->setParameter('status', Trashable::STATUS_INVISIBLE)
            ->setMaxResults($offset)
            ->setFirstResult($first);

        $qb = $this->handleArgumentVisibility($qb, $viewer);

        return $qb->getQuery()->getResult();
    }

    public function countAgainstPublishedBetweenByOpinion(
        \DateTime $from,
        \DateTime $to,
        string $opinionId
    ): int {
        return $this->countPublishedBetweenByOpinion(
            $from,
            $to,
            $opinionId,
            Argument::TYPE_AGAINST
        );
    }

    public function countForPublishedBetweenByOpinion(
        \DateTime $from,
        \DateTime $to,
        string $opinionId
    ): int {
        return $this->countPublishedBetweenByOpinion($from, $to, $opinionId, Argument::TYPE_FOR);
    }

    public function countPublishedArgumentsByStep(ConsultationStep $cs): int
    {
        $qb = $this->getIsEnabledQueryBuilder();

        return $qb
            ->select('count(DISTINCT a.id)')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('a.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->andWhere('a.published = 1 AND a.trashedAt IS NULL')
            ->andWhere(
                $qb
                    ->expr()
                    ->orX(
                        '(a.opinion IS NOT NULL AND o.published = 1 AND oc.step = :cs)',
                        '(a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovoc.step = :cs)'
                    )
            )
            ->setParameter('cs', $cs)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countPublishedArgumentsByConsultation(Consultation $consultation): int
    {
        $qb = $this->getIsEnabledQueryBuilder();

        return $qb
            ->select('count(DISTINCT a.id)')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('a.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere('a.published = 1 AND a.trashedAt IS NULL')
            ->andWhere(
                $qb
                    ->expr()
                    ->orX(
                        '(a.opinion IS NOT NULL AND o.published = 1 AND o.consultation = :consultation)',
                        '(a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovo.consultation = :consultation)'
                    )
            )
            ->setParameter('consultation', $consultation)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countTrashedArgumentsByStep(ConsultationStep $cs): int
    {
        $qb = $this->getIsEnabledQueryBuilder();

        return $qb
            ->select('count(DISTINCT a.id)')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('a.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->andWhere('a.published = 1 AND a.trashedAt IS NOT NULL')
            ->andWhere(
                $qb
                    ->expr()
                    ->orX(
                        '(a.opinion IS NOT NULL AND o.published = 1 AND oc.step = :cs)',
                        '(a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovoc.step = :cs)'
                    )
            )
            ->setParameter('cs', $cs)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countTrashedArgumentsByConsultation(Consultation $consultation): int
    {
        $qb = $this->getIsEnabledQueryBuilder();

        return $qb
            ->select('count(DISTINCT a.id)')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('a.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere('a.published = 1 AND a.trashedAt IS NOT NULL')
            ->andWhere(
                $qb
                    ->expr()
                    ->orX(
                        '(a.opinion IS NOT NULL AND o.published = 1 AND o.consultation = :consultation)',
                        '(a.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovo.consultation = :consultation)'
                    )
            )
            ->setParameter('consultation', $consultation)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function handleArgumentVisibility(QueryBuilder $qb, ?User $viewer = null): QueryBuilder
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

    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('a');
        $qb->where('a.id IN (:ids)')->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('a')->andWhere('a.published = true');
    }

    protected function countPublishedBetweenByOpinion(
        \DateTime $from,
        \DateTime $to,
        string $opinionId,
        int $type
    ): int {
        $qb = $this->getIsEnabledQueryBuilder();
        $qb
            ->select('COUNT(a.id)')
            ->andWhere($qb->expr()->between('a.publishedAt', ':from', ':to'))
            ->andWhere('a.opinion = :id')
            ->andWhere('a.type = :type')
            ->orderBy('a.publishedAt', 'DESC')
            ->setParameters([
                'from' => $from,
                'to' => $to,
                'id' => $opinionId,
                'type' => $type
            ]);

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    private function getByContributionQB(Argumentable $contribution, bool $includeTrashed = false)
    {
        $qb = $this->getIsEnabledQueryBuilder();
        if (!$includeTrashed) {
            $qb->andWhere('a.trashedAt IS NULL');
        }
        if ($contribution instanceof Opinion) {
            $qb->andWhere('a.opinion = :opinion')->setParameter('opinion', $contribution);
        }
        if ($contribution instanceof OpinionVersion) {
            $qb
                ->andWhere('a.opinionVersion = :opinionVersion')
                ->setParameter('opinionVersion', $contribution);
        }

        return $qb;
    }
}
