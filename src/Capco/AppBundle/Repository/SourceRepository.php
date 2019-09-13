<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Model\Sourceable;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class SourceRepository extends EntityRepository
{
    use ContributionRepositoryTrait;

    public function getRecentOrdered()
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                's.id',
                's.title',
                's.createdAt',
                's.updatedAt',
                'a.username as author',
                'ut.name as userType',
                's.published as published',
                's.trashedAt as trashed'
            )
            ->leftJoin('s.author', 'a')
            ->leftJoin('a.userType', 'ut');

        return $qb->getQuery()->getArrayResult();
    }

    public function getByContributionQB(Sourceable $sourceable)
    {
        $qb = $this->getPublishedQueryBuilder();

        if ($sourceable instanceof Opinion) {
            $qb->andWhere('s.opinion = :opinion')->setParameter('opinion', $sourceable->getId());
        }
        if ($sourceable instanceof OpinionVersion) {
            $qb
                ->andWhere('s.opinionVersion = :version')
                ->setParameter('version', $sourceable->getId());
        }

        return $qb;
    }

    public function countByContribution(Sourceable $sourceable): int
    {
        $qb = $this->getByContributionQB($sourceable);
        $qb->select('COUNT(s.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getUnpublishedByContributionAndAuthor(
        Sourceable $sourceable,
        User $author
    ): array {
        $qb = $this->createQueryBuilder('s')
            ->andWhere('s.published = false')
            ->andWhere('s.author = :author')
            ->setParameter('author', $author);
        if ($sourceable instanceof Opinion) {
            $qb->andWhere('s.opinion = :opinion')->setParameter('opinion', $sourceable);
        }
        if ($sourceable instanceof OpinionVersion) {
            $qb->andWhere('s.opinionVersion = :version')->setParameter('version', $sourceable);
        }

        return $qb->getQuery()->getResult();
    }

    public function getByContribution(
        Sourceable $sourceable,
        ?int $limit,
        ?int $first,
        string $field,
        string $direction
    ): Paginator {
        $qb = $this->getByContributionQB($sourceable);

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('s.createdAt', $direction);
        }

        if ('VOTES' === $field) {
            $qb->addOrderBy('s.votesCount', $direction);
        }

        $qb->setFirstResult($first)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function getArrayById(string $id)
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                's.id',
                's.title',
                's.createdAt',
                's.updatedAt',
                'a.username as author',
                's.published as published',
                's.trashedAt as trashed',
                's.body as body'
            )
            ->leftJoin('s.author', 'a')
            ->where('s.id = :id')
            ->setParameter('id', $id);

        return $qb->getQuery()->getOneOrNullResult(Query::HYDRATE_ARRAY);
    }

    public function countByAuthorAndProject(User $author, Project $project): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT(DISTINCT s)')
            ->leftJoin('s.opinion', 'o')
            ->leftJoin('s.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 'ostep')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->leftJoin('ovoc.step', 'ovostep')
            ->leftJoin('ostep.projectAbstractStep', 'opas')
            ->leftJoin('ovostep.projectAbstractStep', 'ovopas')
            ->andWhere('opas.project = :project OR ovopas.project = :project')
            ->andWhere('s.author = :author')
            ->setParameter('project', $project)
            ->setParameter('author', $author);

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult();
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        $qb = $this->getPublishedQueryBuilder()
            ->select('COUNT(DISTINCT s)')
            ->leftJoin('s.opinionVersion', 'ov')
            ->leftJoin('s.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->andWhere('oc.step = :step OR ovoc.step = :step')
            ->andWhere('s.author = :author')
            ->setParameter('step', $step)
            ->setParameter('author', $author);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countAllByAuthor(User $user): int
    {
        $qb = $this->createQueryBuilder('s');
        $qb
            ->select('count(DISTINCT s)')
            ->andWhere('s.author = :author')
            ->setParameter('author', $user);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findAllByAuthor(User $user, int $limit = null, int $offset = null): array
    {
        $qb = $this->createQueryBuilder('s');
        $qb->andWhere('s.author = :author');
        $qb->setParameter('author', $user);

        if ($limit && $offset) {
            $qb->setMaxResults($limit)->setFirstResult($offset);
        }

        return $qb->getQuery()->getResult();
    }

    public function getSourcesByAuthorViewerCanSee(
        User $viewer,
        User $user,
        ?int $limit = null,
        ?int $offset = null
    ): array {
        $qb = $this->createSourcesByAuthorViewerCanSeeQuery($viewer, $user)
            ->setMaxResults($limit)
            ->setFirstResult($offset);

        return $qb->getQuery()->getResult();
    }

    public function countSourcesByAuthorViewerCanSee(User $viewer, User $user): int
    {
        $qb = $this->createSourcesByAuthorViewerCanSeeQuery($viewer, $user);
        $qb->select('COUNT(DISTINCT s.id)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getPublicSourcesByAuthor(User $author, int $offset, int $limit): array
    {
        $qb = $this->createPublicSourcesByAuthorQuery($author);
        $qb->setMaxResults($limit)->setFirstResult($offset);

        return $qb->getQuery()->getResult();
    }

    public function createPublicSourcesByAuthorQuery(User $author): QueryBuilder
    {
        $qb = $this->createQueryBuilder('s');
        $qb
            ->leftJoin('s.opinion', 'o')
            ->leftJoin('s.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')

            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('ovo.consultation', 'ovoc')

            ->leftJoin('oc.step', 'ostep')
            ->leftJoin('ovoc.step', 'ovostep')

            ->leftJoin('ostep.projectAbstractStep', 'opas')
            ->leftJoin('ovostep.projectAbstractStep', 'ovopas')

            ->leftJoin('opas.project', 'pro')
            ->leftJoin('ovopas.project', 'pro2')

            ->andWhere('s.author = :author')
            ->andWhere(
                $qb
                    ->expr()
                    ->orX(
                        $qb->expr()->eq('pro.visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC),
                        $qb->expr()->eq('pro2.visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC)
                    )
            )
            ->setParameter(':author', $author);

        return $qb;
    }

    public function countPublicSourcesByAuthor(User $author): int
    {
        $qb = $this->createPublicSourcesByAuthorQuery($author);
        $qb->select('COUNT(DISTINCT s.id)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Get sources by user.
     */
    public function getByUser($user)
    {
        $qb = $this->getPublishedQueryBuilder()
            ->addSelect('ca', 'o', 'oc', 'cs', 'cas', 'c', 'aut', 'm', 'media')
            ->leftJoin('s.category', 'ca')
            ->leftJoin('s.media', 'media')
            ->leftJoin('s.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 'cs')
            ->leftJoin('cs.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->leftJoin('s.author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->andWhere('s.author = :author')
            ->andWhere('o.published = true')
            ->andWhere('cs.isEnabled = true')
            ->setParameter('author', $user)
            ->orderBy('s.createdAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Get all trashed or unpublished sources for project.
     */
    public function getTrashedByProject(Project $project)
    {
        $qb = $this->createQueryBuilder('s')
            ->addSelect('ca', 'o', 'aut', 'm', 'media')
            ->leftJoin('s.category', 'ca')
            ->leftJoin('s.media', 'media')
            ->leftJoin('s.author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('s.opinion', 'o')
            ->leftJoin('s.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->leftJoin('ovoc.step', 'ovostep')
            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('oc.step', 'ostep')
            ->leftJoin('ostep.projectAbstractStep', 'opas')
            ->leftJoin('ovostep.projectAbstractStep', 'ovopas')
            ->andWhere('opas.project = :project OR ovopas.project = :project')
            ->andWhere('s.trashedAt IS NOT NULL')
            ->setParameter('project', $project)
            ->orderBy('s.trashedAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    public function countPublishedSourcesByStep(ConsultationStep $cs): int
    {
        $query = $this->createQueryBuilder('s');
        $query
            ->select('count(DISTINCT s.id)')
            ->leftJoin('s.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('s.opinion', 'o')

            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('ovo.consultation', 'ovoc')

            ->leftJoin('oc.step', 'ostep')
            ->leftJoin('ovoc.step', 'ovostep')

            ->andWhere('s.published = 1')
            ->andWhere('s.trashedAt IS NULL')
            ->andWhere(
                $query
                    ->expr()
                    ->orX(
                        's.opinion IS NOT NULL AND o.published = 1 AND oc.step = :cs',
                        's.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovoc.step = :cs'
                    )
            )
            ->setParameter('cs', $cs);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    public function countTrashedSourcesByStep(ConsultationStep $cs): int
    {
        $query = $this->createQueryBuilder('s');
        $query
            ->select('count(DISTINCT s.id)')
            ->leftJoin('s.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('ovo.consultation', 'ovoc')
            ->leftJoin('s.opinion', 'o')
            ->leftJoin('o.consultation', 'oc')
            ->andWhere('s.published = 1')
            ->andWhere('s.trashedAt IS NOT NULL')
            ->andWhere(
                $query
                    ->expr()
                    ->orX(
                        's.opinion IS NOT NULL AND o.published = 1 AND oc.step = :cs',
                        's.opinionVersion IS NOT NULL AND ov.published = 1 AND ovo.published = 1 AND ovoc.step = :cs'
                    )
            )
            ->setParameter('cs', $cs);

        return (int) $query->getQuery()->getSingleScalarResult();
    }

    protected function getPublishedQueryBuilder()
    {
        return $this->createQueryBuilder('s')->andWhere('s.published = true');
    }

    private function createSourcesByAuthorViewerCanSeeQuery(
        User $viewer,
        User $author
    ): QueryBuilder {
        $qb = $this->createQueryBuilder('s');

        $qb
            ->leftJoin('s.opinion', 'o')
            ->leftJoin('s.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')

            ->leftJoin('o.consultation', 'oc')
            ->leftJoin('ovo.consultation', 'ovoc')

            ->leftJoin('oc.step', 'ostep')
            ->leftJoin('ovoc.step', 'ovostep')

            ->leftJoin('ostep.projectAbstractStep', 'opas')
            ->leftJoin('ovostep.projectAbstractStep', 'ovopas')

            ->leftJoin('opas.project', 'pro')
            ->leftJoin('ovopas.project', 'pro2')

            ->leftJoin('pro.restrictedViewerGroups', 'prvg')
            ->leftJoin('pro2.restrictedViewerGroups', 'prvg2')

            ->leftJoin('pro.authors', 'pr_au')
            ->leftJoin('pro2.authors', 'pr_au2')
            ->andWhere('s.author = :author');
        if (!$viewer->isSuperAdmin()) {
            $this->getContributionsViewerCanSee($qb, $viewer);

            $visibility = [];
            $visibility[] = ProjectVisibilityMode::VISIBILITY_PUBLIC;
            if ($viewer->isAdmin()) {
                $visibility[] = ProjectVisibilityMode::VISIBILITY_ADMIN;
            }

            $qb = $qb->andWhere(
                $qb
                    ->expr()
                    ->orX(
                        $qb
                            ->expr()
                            ->orX(
                                $qb
                                    ->expr()
                                    ->eq(
                                        'pro2.visibility',
                                        ProjectVisibilityMode::VISIBILITY_PUBLIC
                                    ),
                                $qb->expr()->eq(':viewer', 'pr_au.user')
                            ),
                        $qb
                            ->expr()
                            ->andX(
                                $qb
                                    ->expr()
                                    ->eq(
                                        'pro2.visibility',
                                        ProjectVisibilityMode::VISIBILITY_CUSTOM
                                    ),
                                $qb->expr()->in('prvg2.id', ':prvgId')
                            ),
                        $qb
                            ->expr()
                            ->andX(
                                $qb->expr()->in('pro2.visibility', ':visibility'),
                                $qb
                                    ->expr()
                                    ->lt(
                                        'pro2.visibility',
                                        ProjectVisibilityMode::VISIBILITY_CUSTOM
                                    )
                            )
                    )
            );

            $qb->setParameters([
                ':viewer' => $viewer,
                ':author' => $author,
                ':visibility' => $visibility,
                ':prvgId' => $viewer->getUserGroupIds()
            ]);
        } else {
            $qb->setParameter(':author', $author);
        }

        return $qb;
    }
}
