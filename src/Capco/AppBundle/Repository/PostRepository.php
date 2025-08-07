<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\PostOrderField;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Symfony\Component\Security\Core\User\UserInterface;

class PostRepository extends EntityRepository
{
    private const ORDERS = [
        'UPDATED_AT' => 'updatedAt',
        'CREATED_AT' => 'createdAt',
    ];

    public function getPublishedPostsByProposal(Proposal $proposal): array
    {
        return $this->createPublishedPostsByProposalQB($proposal)
            ->addSelect('pa', 'm', 't')
            ->leftJoin('p.authors', 'pa')
            ->leftJoin('p.media', 'm')
            ->leftJoin('p.themes', 't')
            ->addOrderBy('p.publishedAt', 'DESC')
            ->setParameter('id', $proposal->getId())
            ->getQuery()
            ->getResult()
        ;
    }

    public function getProposalBlogPostPublishedBetween(
        \DateTime $from,
        \DateTime $to,
        string $proposalId
    ): array {
        $query = $this->getIsPublishedQueryBuilder()
            ->leftJoin('p.proposals', 'proposal')
            ->andWhere('proposal.id = :id')
            ->setParameter('id', $proposalId)
            ->addSelect('pa', 'm', 't')
            ->leftJoin('p.authors', 'pa')
            ->leftJoin('p.media', 'm')
            ->leftJoin('p.themes', 't')
        ;

        $query
            ->andWhere($query->expr()->between('p.publishedAt', ':from', ':to'))
            ->setParameter('from', $from)
            ->setParameter('to', $to)
        ;

        return $query->getQuery()->getResult();
    }

    public function getOrderedPublishedPostsByProposal(
        Proposal $proposal,
        ?int $limit,
        string $field,
        int $offset = 0,
        string $direction = 'ASC'
    ): Paginator {
        $query = $this->createPublishedPostsByProposalQB($proposal)
            ->addSelect('pa', 'm', 't')
            ->leftJoin('p.authors', 'pa')
            ->leftJoin('p.media', 'm')
            ->leftJoin('p.themes', 't')
            ->setParameter('id', $proposal->getId())
        ;

        if ('CREATED_AT' === $field) {
            $query->orderBy('p.createdAt', $direction);
        }

        if ('UPDATED_AT' === $field) {
            $query->orderBy('p.updatedAt', $direction);
        }

        if ('PUBLISHED_AT' === $field) {
            $query->orderBy('p.publishedAt', $direction);
        }

        if ($limit) {
            $query->setMaxResults($limit);
            $query->setFirstResult($offset);
        }

        return new Paginator($query);
    }

    public function countPublishedPostsByProposal(Proposal $proposal): int
    {
        return (int) $this->createPublishedPostsByProposalQB($proposal)
            ->select('count(p.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function getSearchResults(
        int $nbByPage = 8,
        int $page = 1,
        ?string $themeTranslationSlug = null,
        ?string $projectSlug = null,
        ?bool $displayedOnBlog = null,
        ?UserInterface $viewer = null
    ): Paginator {
        if ($page < 1) {
            throw new \InvalidArgumentException(sprintf('The argument "page" cannot be lower than 1 (current value: "%s")', $page));
        }

        $qb = $this->getIsPublishedQueryBuilder('p')
            ->addSelect('pa', 'm', 't', 'project', 'proposal', 'crvg')
            ->leftJoin('p.authors', 'pa')
            ->leftJoin('p.media', 'm')
            ->leftJoin('p.themes', 't', 'WITH', 't.isEnabled = true')
            ->leftJoin('t.translations', 'translation')
            ->leftJoin('p.projects', 'project')
            ->leftJoin('project.authors', 'projectAuthor')
            ->leftJoin('p.proposals', 'proposal')
            ->leftJoin('project.restrictedViewerGroups', 'crvg')
            ->orderBy('p.publishedAt', 'DESC')
        ;

        if (!$viewer) {
            $qb->andWhere(
                $qb
                    ->expr()
                    ->orX(
                        $qb
                            ->expr()
                            ->eq('project.visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC),
                        $qb->expr()->isNull('project')
                    )
            );
        }

        if ($viewer && !$viewer->isSuperAdmin()) {
            $qb->orWhere(
                $qb
                    ->expr()
                    ->orX(
                        $qb
                            ->expr()
                            ->eq('project.visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC)
                    )
            );
            if (!empty($viewer->getUserGroupIds())) {
                $qb->orWhere($qb->expr()->in('crvg.id', $viewer->getUserGroupIds()));
                $qb->orWhere(
                    $qb->expr()->eq('project.visibility', ProjectVisibilityMode::VISIBILITY_CUSTOM)
                );
            }
            if ($viewer->isAdmin()) {
                $qb->orWhere(
                    $qb->expr()->eq('project.visibility', ProjectVisibilityMode::VISIBILITY_ADMIN)
                );
                $qb->orWhere(
                    $qb
                        ->expr()
                        ->andX(
                            $qb->expr()->in('projectAuthor.user', [$viewer->getId()]),
                            $qb
                                ->expr()
                                ->eq('project.visibility', ProjectVisibilityMode::VISIBILITY_ME)
                        )
                );
            }
        }

        if (null !== $displayedOnBlog) {
            $qb->andWhere('p.displayedOnBlog = :displayedOnBlog')->setParameter(
                ':displayedOnBlog',
                $displayedOnBlog
            );
        }

        if (null !== $themeTranslationSlug && Theme::FILTER_ALL !== $themeTranslationSlug) {
            $qb->andWhere('translation.slug = :theme')->setParameter(
                'theme',
                $themeTranslationSlug
            );
        }

        if (null !== $projectSlug && Project::FILTER_ALL !== $projectSlug) {
            $qb->andWhere('project.slug = :project')->setParameter('project', $projectSlug);
        }

        $query = $qb->getQuery();

        if ($nbByPage > 0) {
            $query->setFirstResult(($page - 1) * $nbByPage)->setMaxResults($nbByPage);
        }

        return new Paginator($query);
    }

    public function countSearchResults(?string $themeSlug = null, ?string $projectSlug = null): int
    {
        $qb = $this->getIsPublishedQueryBuilder('p')->select('COUNT(p.id)');

        if (null !== $themeSlug && Theme::FILTER_ALL !== $themeSlug) {
            $qb->innerJoin('p.themes', 't', 'WITH', 't.isEnabled = true')
                ->andWhere('t.slug = :theme')
                ->setParameter('theme', $themeSlug)
            ;
        }

        if (null !== $projectSlug && Project::FILTER_ALL !== $projectSlug) {
            $qb->innerJoin('p.projects', 'c')
                ->andWhere('c.slug = :project')
                ->setParameter('project', $projectSlug)
            ;
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getLast(int $limit = 1, int $offset = 0): Paginator
    {
        $qb = $this->getIsPublishedQueryBuilder()
            ->addSelect('pa', 'm', 'c', 't')
            ->leftJoin('p.authors', 'pa')
            ->leftJoin('p.media', 'm')
            ->leftJoin('p.projects', 'c')
            ->leftJoin('p.themes', 't')
            ->andWhere('p.displayedOnBlog = true')
            ->addOrderBy('p.publishedAt', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return new Paginator($qb->getQuery(), true);
    }

    public function getLastPublishedByProject(string $projectSlug, int $limit = 1, int $offset = 0)
    {
        $qb = $this->getIsPublishedQueryBuilder()
            ->addSelect('pa', 'm', 'c', 't')
            ->leftJoin('p.authors', 'pa')
            ->leftJoin('p.media', 'm')
            ->leftJoin('p.projects', 'c')
            ->leftJoin('p.themes', 't')
            ->andWhere('c.slug = :project')
            ->setParameter('project', $projectSlug)
            ->addOrderBy('p.publishedAt', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->execute();
    }

    public function countPublishedByProject(Project $project): int
    {
        $qb = $this->getIsPublishedQueryBuilder()
            ->select('COUNT(p.id)')
            ->andWhere(':project MEMBER OF p.projects')
            ->setParameter('project', $project)
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getPublishedBySlug(string $slug): ?Post
    {
        $qb = $this->getIsPublishedQueryBuilder('p')
            ->addSelect('pa', 'u', 'um', 'm', 'c', 't')
            ->leftJoin('p.authors', 'pa')
            ->leftJoin('pa.author', 'u')
            ->leftJoin('u.media', 'um')
            ->leftJoin('p.media', 'm')
            ->leftJoin('p.themes', 't', 'WITH', 't.isEnabled = true')
            ->leftJoin('p.projects', 'c', 'WITH', 'c.visibility = :visibility')
            ->leftJoin('p.translations', 'translations')
            ->andWhere('translations.slug = :slug')
            ->setParameter('slug', $slug)
            ->setParameter('visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC)
            ->orderBy('p.publishedAt', 'DESC')
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getRecentPosts(int $count = 5): array
    {
        $qb = $this->createQueryBuilder('p')
            ->addSelect('pa', 'm', 'c', 't')
            ->leftJoin('p.authors', 'pa')
            ->leftJoin('p.media', 'm')
            ->leftJoin('p.themes', 't')
            ->leftJoin('p.projects', 'c')
            ->orderBy('p.createdAt', 'DESC')
            ->addOrderBy('p.publishedAt', 'DESC')
            ->setMaxResults($count)
        ;

        return $qb->getQuery()->getResult();
    }

    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('p')
            ->addSelect('pa', 'm', 'projects', 't')
            ->leftJoin('p.authors', 'pa')
            ->leftJoin('p.media', 'm')
            ->leftJoin('p.projects', 'projects')
            ->leftJoin('p.themes', 't')
            ->where('p.id IN (:ids)')
            ->setParameter('ids', $ids)
        ;

        return $qb->getQuery()->getResult();
    }

    public function getByOwner(Owner $owner, int $offset, int $limit, array $options): array
    {
        return $this->getByOwnerQueryBuilder($owner, $options)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult()
        ;
    }

    public function countByOwner(Owner $owner, array $options): int
    {
        return $this->getByOwnerQueryBuilder($owner, $options)
            ->select('count(p.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * @throws NonUniqueResultException
     * @throws NoResultException
     */
    public function countPublicPosts(
        ?string $themeId = null,
        ?string $projectId = null,
    ): int {
        $qb = $this->getPublicPostsQueryBuilder($themeId, $projectId);

        return (int) $qb->select('count(p.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * @param array{field: string, direction: string} $orderBy
     *
     * @return Post[]
     */
    public function getPublicPosts(
        ?string $themeId = null,
        ?string $projectId = null,
        int $offset = 0,
        int $limit = 50,
        array $orderBy = ['field' => 'publishedAt', 'direction' => 'DESC'],
    ): array {
        $qb = $this->getPublicPostsQueryBuilder($themeId, $projectId);

        if (
            [] !== $orderBy
            && \array_key_exists('field', $orderBy)
            && \array_key_exists('direction', $orderBy)
            && \array_key_exists($orderBy['field'], PostOrderField::SORT_FIELD)
            && \array_key_exists($orderBy['direction'], OrderDirection::SORT_DIRECTION)
        ) {
            $field = PostOrderField::SORT_FIELD[$orderBy['field']];
            $direction = OrderDirection::SORT_DIRECTION[$orderBy['direction']];
            $qb->orderBy("p.{$field}", $direction);
        }

        return $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult()
        ;
    }

    protected function getIsPublishedQueryBuilder(string $alias = 'p'): QueryBuilder
    {
        return $this->createQueryBuilder($alias)
            ->andWhere($alias . '.isPublished = true')
            ->andWhere($alias . '.publishedAt <= :now')
            ->setParameter('now', new \DateTime())
        ;
    }

    private function getPublicPostsQueryBuilder(
        ?string $themeId = null,
        ?string $projectId = null
    ): QueryBuilder {
        $qb = $this->getIsPublishedQueryBuilder()
            ->andWhere('p.displayedOnBlog = true')
        ;

        if (null !== $themeId) {
            $qb->leftJoin('p.themes', 't')
                ->andWhere('t.id = :themeId')
                ->setParameter('themeId', $themeId)
            ;
        }

        if (null !== $projectId) {
            $qb->leftJoin('p.projects', 'c')
                ->andWhere('c.id = :projectId')
                ->setParameter('projectId', $projectId)
            ;
        }

        return $qb;
    }

    private function createPublishedPostsByProposalQB(Proposal $proposal): QueryBuilder
    {
        return $this->getIsPublishedQueryBuilder()
            ->leftJoin('p.proposals', 'proposal')
            ->andWhere('proposal.id = :id')
            ->setParameter('id', $proposal->getId())
        ;
    }

    private function getByOwnerQueryBuilder(Owner $owner, array $options): QueryBuilder
    {
        $ownerField = $owner instanceof User ? 'p.owner' : 'p.organizationOwner';

        $qb = $this->createQueryBuilder('p')
            ->where("{$ownerField} = :owner")
            ->setParameter('owner', $owner)
        ;

        if ($query = $options['query']) {
            $qb->join('p.translations', 'pt');
            $qb->andWhere('pt.title LIKE :query');
            $qb->setParameter('query', "%{$query}%");
        }

        if ($options['hideUnpublishedPosts']) {
            $qb->andWhere('p.isPublished = true');
        }

        $orderByField = $options['orderByField'];
        $orderByDirection = $options['orderByDirection'];

        if ($orderByField && $orderByDirection) {
            $qb->orderBy('p.' . self::ORDERS[$orderByField], $orderByDirection);
        }

        return $qb;
    }
}
