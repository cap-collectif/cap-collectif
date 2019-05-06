<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Entity\Theme;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Event;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class EventRepository extends EntityRepository
{
    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('e');
        $qb
            ->addSelect('a', 'm', 't')
            ->leftJoin('e.author', 'a')
            ->leftJoin('a.media', 'm')
            ->leftJoin('e.themes', 't')
            ->where('e.id IN (:ids)')
            ->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    /**
     * Get events depending on theme, project and search term, ordered by startAt criteria.
     *
     * @param null|mixed $archived
     * @param null|mixed $themeSlug
     * @param null|mixed $projectSlug
     * @param null|mixed $term
     * @param null|mixed $limit
     * @param null|mixed $offset
     */
    public function getSearchResults(
        $archived = null,
        $themeSlug = null,
        $projectSlug = null,
        $term = null,
        $limit = null,
        $offset = null
    ) {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't', 'c')
            ->leftJoin('e.author', 'a')
            ->leftJoin('a.media', 'm')
            ->leftJoin('e.themes', 't', 'WITH', 't.isEnabled = true')
            ->leftJoin('e.projects', 'c', 'WITH', 'c.visibility = :visibility')
            ->setParameter('visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC)
            ->orderBy('e.startAt', 'ASC');
        if (null !== $archived) {
            $qb = $this->whereIsArchived($archived, $qb);
        }

        if ($themeSlug && Theme::FILTER_ALL !== $themeSlug) {
            $qb->andWhere('t.slug = :theme')->setParameter('theme', $themeSlug);
        }

        if (null !== $projectSlug && Project::FILTER_ALL !== $projectSlug) {
            $qb->andWhere('c.slug = :project')->setParameter('project', $projectSlug);
        }

        if ($term) {
            $qb->andWhere('e.title LIKE :term')->setParameter('term', '%' . $term . '%');
        }

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return new Paginator($qb, ($fetchJoin = true));
    }

    public function countAllByUser(User $user): int
    {
        $qb = $this->createQueryBuilder('e');
        $qb
            ->select('count(DISTINCT e)')
            ->andWhere('e.author = :user')
            ->setParameter('user', $user);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findAllByUser(User $user, string $field = null, string $direction = null): array
    {
        $qb = $this->createQueryBuilder('e');
        $qb->andWhere('e.author = :user')->setParameter('user', $user);

        if ($field && $direction && 'START_AT' === $field) {
            $qb->addOrderBy('e.startAt', $direction);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Count events depending on theme, project and search term.
     *
     * @param $archived
     * @param null $themeSlug
     * @param null $projectSlug
     * @param null $term
     *
     * @return array
     */
    public function countSearchResults(
        $archived = null,
        $themeSlug = null,
        $projectSlug = null,
        $term = null
    ) {
        $qb = $this->getIsEnabledQueryBuilder()->select('COUNT(e.id)');
        if (null !== $archived) {
            $qb = $this->whereIsArchived($archived, $qb);
        }

        if (null !== $themeSlug && Theme::FILTER_ALL !== $themeSlug) {
            $qb
                ->innerJoin('e.themes', 't', 'WITH', 't.isEnabled = true')
                ->andWhere('t.slug = :theme')
                ->setParameter('theme', $themeSlug);
        }

        if (null !== $projectSlug && Project::FILTER_ALL !== $projectSlug) {
            $qb
                ->innerJoin('e.projects', 'c', 'WITH', 'c.visibility = :visibility')
                ->andWhere('c.slug = :project')
                ->setParameter('visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC)
                ->setParameter('project', $projectSlug);
        }

        if (null !== $term) {
            $qb->andWhere('e.title LIKE :term')->setParameter('term', '%' . $term . '%');
        }

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Get one event by slug.
     */
    public function getOneBySlug(string $slug): ?Event
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 't', 'media', 'registration', 'c')
            ->leftJoin('e.author', 'a')
            ->leftJoin('e.media', 'media')
            ->leftJoin('e.themes', 't', 'WITH', 't.isEnabled = true')
            ->leftJoin('e.projects', 'c', 'WITH', 'c.visibility = :visibility')
            ->leftJoin('e.registrations', 'registration', 'WITH', 'registration.confirmed = true')
            ->andWhere('e.slug = :slug')
            ->setParameter('visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC)
            ->setParameter('slug', $slug);

        return $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * Get last future events.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return mixed
     */
    public function getLast($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 't', 'media', 'c')
            ->leftJoin('e.author', 'a')
            ->leftJoin('e.themes', 't')
            ->leftJoin('e.projects', 'c')
            ->leftJoin('e.media', 'media')
            ->orderBy('e.startAt', 'ASC');

        $qb = $this->whereIsFuture($qb);

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return new Paginator($qb, ($fetchJoin = true));
    }

    public function countByProject(string $projectId): int
    {
        $query = $this->createQueryBuilder('e')->select('COUNT(e.id)');

        return (int) $query
            ->leftJoin('e.projects', 'p')
            ->where('p.id = :project')
            ->setParameter('project', $projectId)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getByProject(Project $project, int $first = 0, int $offset = 100): Paginator
    {
        $query = $this->createQueryBuilder('e')
            ->leftJoin('e.projects', 'p')
            ->andWhere('p.id = :project')
            ->setParameter('project', $project->getId())
            ->setFirstResult($first)
            ->setMaxResults($offset);

        return new Paginator($query);
    }

    protected function getIsEnabledQueryBuilder(): QueryBuilder
    {
        return $this->createQueryBuilder('e')->andWhere('e.enabled = true');
    }

    protected function whereIsFuture(QueryBuilder $qb, string $alias = 'e'): QueryBuilder
    {
        return $qb
            ->andWhere(
                '(' .
                    $alias .
                    '.endAt IS NULL AND :now <= ' .
                    $alias .
                    '.startAt) OR (' .
                    $alias .
                    '.endAt IS NOT NULL AND :now < ' .
                    $alias .
                    '.endAt)'
            )
            ->setParameter('now', new \DateTime());
    }

    protected function whereIsArchived(
        bool $archived,
        QueryBuilder $qb,
        string $alias = 'e'
    ): QueryBuilder {
        if ($archived) {
            return $qb
                ->andWhere(
                    '(' .
                        $alias .
                        '.endAt IS NOT NULL AND :now > ' .
                        $alias .
                        '.endAt) OR (' .
                        $alias .
                        '.endAt IS NULL AND DATE(:now) > DATE(' .
                        $alias .
                        '.startAt))'
                )
                ->setParameter('now', new \DateTime())
                ->orderBy($alias . '.startAt', 'DESC');
        }

        return $qb
            ->andWhere(
                '(' .
                    $alias .
                    '.endAt IS NULL AND DATE(:now) <= DATE(' .
                    $alias .
                    '.startAt)) OR (' .
                    $alias .
                    '.endAt IS NOT NULL AND :now < ' .
                    $alias .
                    '.endAt)'
            )
            ->setParameter('now', new \DateTime());
    }
}
