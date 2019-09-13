<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Interfaces\Trashable;

class ArgumentRepository extends EntityRepository
{
    use ContributionRepositoryTrait;

    public function getRecentOrdered()
    {
        $qb = $this->createQueryBuilder('a')
            ->select(
                'a.id',
                'a.createdAt',
                'a.updatedAt',
                'aut.username as author',
                'ut.name as userType',
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
            ->leftJoin('cas.project', 'c');

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
     * Count all arguments by user.
     */
    public function countByUser(User $user): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(a) as TotalArguments')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->andWhere('a.Author = :author')
            ->andWhere('o.published = true')
            ->andWhere('s.isEnabled = true')
            ->andWhere('a.trashedStatus <> :status OR a.trashedStatus IS NULL')
            ->setParameter('status', Trashable::STATUS_INVISIBLE)
            ->setParameter('author', $user);

        return $qb->getQuery()->getSingleScalarResult();
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

    /**
     * Get all arguments by user.
     */
    public function getByUser(User $user, int $first = 0, int $offset = 100): Paginator
    {
        $query = $this->getIsEnabledQueryBuilder();
        $query
            ->andWhere('a.Author = :author')
            ->andWhere('a.trashedStatus <> :status OR a.trashedStatus IS NULL')
            ->setParameter('author', $user)
            ->setParameter('status', Trashable::STATUS_INVISIBLE)
            ->setMaxResults($offset)
            ->setFirstResult($first);

        return new Paginator($query);
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
