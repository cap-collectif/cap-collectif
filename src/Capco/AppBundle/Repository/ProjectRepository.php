<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\Interfaces\ProjectOwner;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Traits\ProjectVisibilityTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr;
use Doctrine\ORM\Query\ResultSetMapping;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @method null|Project[] findAll()
 */
class ProjectRepository extends EntityRepository implements SluggableRepositoryInterface
{
    use ProjectVisibilityTrait;

    public function findAllIdsWithSlugs(): array
    {
        $qb = $this->createQueryBuilder('p');

        return $qb
            ->select('p.id', 'p.slug')
            ->getQuery()
            ->getArrayResult()
        ;
    }

    public function findAllWithSteps()
    {
        $qb = $this->createQueryBuilder('p');

        return $qb
            ->addSelect('pas', 'step', 'status', 'theme')
            ->leftJoin('p.steps', 'pas')
            ->leftJoin('pas.step', 'step')
            ->leftJoin('step.statuses', 'status')
            ->leftJoin('p.themes', 'theme')
            ->getQuery()
            ->getResult()
        ;
    }

    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('p');
        $qb->addSelect('theme', 'cover', 'authors', 'positioner', 'pas', 'step', 'district')
            ->leftJoin('p.themes', 'theme', 'WITH', 'theme.isEnabled = true')
            ->leftJoin('p.projectDistrictPositioners', 'positioner')
            ->leftJoin('positioner.district', 'district')
            ->leftJoin('p.cover', 'cover')
            ->leftJoin('p.authors', 'authors')
            ->leftJoin('p.steps', 'pas')
            ->leftJoin('pas.step', 'step')
            ->where('p.id IN (:ids)')
            ->setParameter('ids', $ids)
        ;

        return $qb->getQuery()->getResult();
    }

    public static function getOneWithoutVisibilityCacheKey(string $slug): string
    {
        return 'ProjectRepository_getOneWithoutVisibility_resultcache_' . $slug;
    }

    /**
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneWithoutVisibility(string $slug): ?Project
    {
        $qb = $this->createQueryBuilder('p')
            ->addSelect('theme', 'cover', 'authors', 'positioner', 'pas', 'step', 'district')
            ->leftJoin('p.themes', 'theme', 'WITH', 'theme.isEnabled = true')
            ->leftJoin('p.projectDistrictPositioners', 'positioner')
            ->leftJoin('positioner.district', 'district')
            ->leftJoin('p.cover', 'cover')
            ->leftJoin('p.authors', 'authors')
            ->leftJoin('p.steps', 'pas')
            ->leftJoin('pas.step', 'step')
            ->andWhere('p.slug = :slug')
            ->setParameter('slug', $slug)
        ;

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->enableResultCache(60, self::getOneWithoutVisibilityCacheKey($slug))
            ->getOneOrNullResult()
        ;
    }

    public function getBySlug(string $slug): ?Project
    {
        return $this->getOneWithoutVisibility($slug);
    }

    public function getByUser(User $user, $viewer = null)
    {
        $qb = $this->getProjectsViewerCanSeeQueryBuilder($viewer)
            ->addSelect('a', 'u', 't')
            ->leftJoin('p.projectType', 't')
            ->leftJoin('p.authors', 'a')
            ->leftJoin('a.user', 'u')
            ->andWhere('u = :user')
            ->setParameter('user', $user)
            ->orderBy('p.updatedAt', 'DESC')
        ;

        return $qb->getQuery()->execute();
    }

    public function getByOwnerPaginated(
        ProjectOwner $owner,
        int $offset,
        int $limit,
        ?User $viewer = null,
        array $orderBy = ['field' => 'publishedAt', 'direction' => 'DESC'],
        ?int $status = null
    ): array {
        $projects = $this->getByOwnerQueryBuilder($owner, $viewer)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->orderBy("p.{$orderBy['field']}", $orderBy['direction'])
            ->getQuery()
            ->getResult()
        ;

        if (null !== $status) {
            $projects = array_filter($projects, fn (Project $project) => $project->getCurrentStepState() === $status);
        }

        return $projects;
    }

    public function countByOwner(ProjectOwner $owner, ?User $viewer = null): int
    {
        return $this->getByOwnerQueryBuilder($owner, $viewer)
            ->select('count(p.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function getByOwnerQueryBuilder(ProjectOwner $owner, ?User $viewer = null): QueryBuilder
    {
        $qb = $this->getProjectsViewerCanSeeQueryBuilder($viewer)
            ->leftJoin($owner instanceof User ? 'p.owner' : 'p.organizationOwner', 'o')
            ->andWhere('o.id = :ownerId')
            ->setParameter('ownerId', $owner->getId())
            ->orderBy('p.updatedAt', 'DESC')
        ;

        if ($owner instanceof Organization && $viewer && $viewer->isMemberOfOrganization($owner)) {
            $qb->orWhere('authors.organization = :ownerId');
        }

        return $qb;
    }

    public function getProjectsViewerCanSeeQueryBuilder($viewer = null): QueryBuilder
    {
        $visibility = $this->getVisibilityForViewer($viewer);

        $qb = $this->createQueryBuilder('p')
            ->addSelect('authors')
            ->leftJoin('p.authors', 'authors')
            ->leftJoin('p.restrictedViewerGroups', 'pvg')
            ->orWhere('p.visibility IN (:visibility)')
            ->setParameter('visibility', $visibility)
        ;

        $viewerGroups = $viewer instanceof User ? $viewer->getUserGroupIds() : [];

        if ($viewer instanceof User && !$viewer->isSuperAdmin()) {
            if ($viewerGroups) {
                $qb->orWhere(
                    $qb
                        ->expr()
                        ->andX(
                            $qb->expr()->eq('p.visibility', ':custom'),
                            $qb->expr()->in('pvg.id', ':pvgId')
                        )
                );
                $qb->setParameter('custom', ProjectVisibilityMode::VISIBILITY_CUSTOM);
                $qb->setParameter('pvgId', $viewerGroups);
            }
            $qb->orWhere(
                $qb
                    ->expr()
                    ->andX(
                        $qb->expr()->eq('p.visibility', ':me'),
                        $qb->expr()->eq('authors.user', ':viewer')
                    )
            );
            $qb->setParameter('me', ProjectVisibilityMode::VISIBILITY_ME);
            $qb->setParameter('viewer', $viewer);
        }

        return $qb;
    }

    public function getByUserPublicPaginated(User $user, int $offset, int $limit): Paginator
    {
        $query = $this->getUserProjectPublicQueryBuilder($user);
        $query->addSelect('u');
        $query->setFirstResult($offset)->setMaxResults($limit);

        return new Paginator($query);
    }

    public function countPublicPublished(User $user): int
    {
        $query = $this->getUserProjectPublicQueryBuilder($user);

        $query->select('COUNT(DISTINCT(p.id))');

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getProjectAuthorsId($viewer = null, $order = 'DESC')
    {
        $qb = $this->getProjectsViewerCanSeeQueryBuilder($viewer)
            ->select('organization.id as oid, u.id as uid')
            ->leftJoin('p.authors', 'pa')
            ->leftJoin('pa.organization', 'organization')
            ->leftJoin('pa.user', 'u')
            ->andWhere('u.id IS NOT NULL OR organization.id IS NOT NULL')
            ->orderBy('pa.createdAt', $order)
        ;

        return $qb->getQuery()->execute();
    }

    public function getSearchResults(
        int $nbByPage = 8,
        int $page = 1,
        $theme = null,
        $sort = null,
        $term = null,
        $type = null,
        $viewer = null
    ): Paginator {
        if ($page < 1) {
            throw new \InvalidArgumentException(sprintf('The argument "page" cannot be lower than 1 (current value: "%s")', $page));
        }

        $qb = $this->getProjectsViewerCanSeeQueryBuilder($viewer);

        $qb->addSelect('t', 'pas', 's', 'pov')
            ->leftJoin('p.themes', 't')
            ->leftJoin('t.translations', 'translation')
            ->leftJoin('p.steps', 'pas')
            ->leftJoin('pas.step', 's')
            ->leftJoin('p.cover', 'pov')
            ->leftJoin('p.projectType', 'projectType')
            ->addOrderBy('p.publishedAt', 'DESC')
        ;

        if (null !== $theme && Theme::FILTER_ALL !== $theme) {
            $qb->andWhere('translations.slug = :theme')->setParameter('theme', $theme);
        }

        if (null !== $term) {
            $qb->andWhere('p.title LIKE :term')->setParameter('term', '%' . $term . '%');
        }

        if (null !== $type) {
            $qb->andWhere('projectType.slug = :type')->setParameter('type', $type);
        }

        if (
            isset(Project::$sortOrder[$sort])
            && Project::SORT_ORDER_CONTRIBUTIONS_COUNT === Project::$sortOrder[$sort]
        ) {
            $qb->orderBy('p.contributionsCount', 'DESC');
        } else {
            $qb->orderBy('p.publishedAt', 'DESC');
        }

        $query = $qb->getQuery();

        if ($nbByPage > 0) {
            $query->setFirstResult(($page - 1) * $nbByPage)->setMaxResults($nbByPage);
        }

        return new Paginator($query);
    }

    public function getLastPublished($limit = 1, $offset = 0, $viewer = null): array
    {
        $qb = $this->getProjectsViewerCanSeeQueryBuilder($viewer)
            ->addSelect('t', 'pas', 's', 'pov', 'pvg')
            ->leftJoin('p.themes', 't')
            ->leftJoin('p.steps', 'pas')
            ->leftJoin('pas.step', 's')
            ->leftJoin('p.cover', 'pov')
            ->leftJoin('p.projectType', 'type')
            ->addOrderBy('p.publishedAt', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        $results = new Paginator($qb, ($fetchJoin = true));
        $projects = [];
        foreach ($results as $project) {
            $projects[] = $project;
        }

        return $projects;
    }

    public function getProjectsByTheme(Theme $theme, $viewer = null): array
    {
        $query = $this->getProjectsViewerCanSeeQueryBuilder($viewer)
            ->addSelect('t', 'pas', 's', 'pov')
            ->leftJoin('p.themes', 't')
            ->leftJoin('p.steps', 'pas')
            ->leftJoin('pas.step', 's')
            ->leftJoin('p.cover', 'pov')
            ->leftJoin('p.projectType', 'type')
            ->andWhere('t = :theme')
            ->setParameter('theme', $theme)
            ->addOrderBy('p.publishedAt', 'DESC')
        ;

        return $query->getQuery()->getResult();
    }

    public function countPublished($viewer = null): int
    {
        $qb = $this->getProjectsViewerCanSeeQueryBuilder($viewer)->select('COUNT(p.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getDistinctProjectTypesUsedByProjects($viewer = null): array
    {
        $projects = $this->getProjectsViewerCanSeeQueryBuilder($viewer)
            ->getQuery()
            ->getResult()
        ;

        return $this->createQueryBuilder('p')
            ->select('DISTINCT(p.projectType) as id')
            ->addSelect('pt.title, pt.slug, pt.color')
            ->leftJoin('p.projectType', 'pt')
            ->where('p IN (:projects)')
            ->andWhere('p.projectType IS NOT NULL')
            ->setParameter('projects', $projects)
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 60)
            ->getArrayResult()
        ;
    }

    public function getAssignedProjects(User $user): array
    {
        /*
         *  THE PURE SQL QUERY
         *
         *  SELECT DISTINCT(project.id) as id
         *  FROM project
         *  LEFT JOIN  project_abstractstep pa ON pa.project_id = project.id
         *  LEFT JOIN  step ON step.id = pa.step_id
         *  LEFT JOIN  proposal_form pf ON pf.step_id = step.id
         *  LEFT JOIN proposal ON proposal.proposal_form_id = pf.id
         *  LEFT JOIN proposal_supervisor supervisor ON supervisor.proposal_id = proposal.id
         *  LEFT JOIN proposal_analyst analyst ON analyst.proposal_id = proposal.id
         *  LEFT JOIN proposal_decision_maker decision_maker ON decision_maker.proposal_id = proposal.id
         *  WHERE supervisor.supervisor_id ='user523'
         *  OR  analyst.analyst_id ='user523'
         *  OR  decision_maker.decision_maker_id ='user523';
         */

        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('id', 'id');

        $query = $this->getEntityManager()
            ->createNativeQuery(
                'SELECT DISTINCT(project.id) as id
                   FROM project
                   LEFT JOIN  project_abstractstep pa ON pa.project_id = project.id
                   LEFT JOIN  step ON step.id = pa.step_id
                   LEFT JOIN  proposal_form pf ON pf.step_id = step.id
                   LEFT JOIN proposal ON proposal.proposal_form_id = pf.id
                   LEFT JOIN proposal_supervisor supervisor ON supervisor.proposal_id = proposal.id
                   LEFT JOIN proposal_analyst analyst ON analyst.proposal_id = proposal.id
                   LEFT JOIN proposal_decision_maker decision_maker ON decision_maker.proposal_id = proposal.id
                   WHERE supervisor.supervisor_id = :userId
                   OR  analyst.analyst_id = :userId
                   OR  decision_maker.decision_maker_id = :userId',
                $rsm
            )
            ->setParameter('userId', $user->getId())
        ;
        $projectIds = $query->getResult();

        return $this->createQueryBuilder('p')
            ->andWhere('p.id IN (:projectIds)')
            ->setParameter('projectIds', $projectIds)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findByDistrict(
        GlobalDistrict $district,
        $user,
        int $offset,
        int $limit
    ): Paginator {
        $qb = $this->getProjectsViewerCanSeeQueryBuilder($user);

        $qb->leftJoin('p.projectDistrictPositioners', 'pd')
            ->andWhere('pd.district = :district')
            ->setParameter('district', $district)
        ;

        $query = $qb
            ->getQuery()
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;

        return new Paginator($query);
    }

    public function countByDistrict(GlobalDistrict $district, $user): int
    {
        $qb = $this->getProjectsViewerCanSeeQueryBuilder($user);

        $qb->select('COUNT(p.id)')
            ->leftJoin('p.projectDistrictPositioners', 'pd')
            ->andWhere('pd.district = :district')
            ->setParameter('district', $district)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function findMediatorProjectsByUser(User $user): array
    {
        $qb = $this->createQueryBuilder('p')
            ->join('p.steps', 'pas')
            ->join('pas.step', 's')
            ->join('s.mediators', 'm')
            ->where('m.user = :user')
            ->setParameter('user', $user)
        ;

        return $qb->getQuery()->getResult();
    }

    private function getUserProjectPublicQueryBuilder(User $user): QueryBuilder
    {
        return $this->getProjectsViewerCanSeeQueryBuilder($user)
            ->innerJoin('authors.user', 'u', Expr\Join::WITH, 'u = :user')
            ->andWhere('p.visibility = :visibility')
            ->setParameter('user', $user)
            ->setParameter('visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC)
        ;
    }
}
