<?php

namespace Capco\AppBundle\Repository;

use Doctrine\DBAL\Types\Type;
use Doctrine\ORM\QueryBuilder;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Model\CommentableInterface;

class ProposalCommentRepository extends EntityRepository
{
    public function getByCommentable(
        CommentableInterface $commentable,
        ?int $offset,
        ?int $limit,
        string $field,
        string $direction,
        ?User $viewer
    ): Paginator {
        $qb = $this->getByCommentableQueryBuilder($commentable, true, $viewer);
        // Pinned always come first
        $qb->addOrderBy('c.pinned', 'DESC');

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('c.publishedAt', $direction);
            $qb->addOrderBy('c.createdAt', $direction);
        }

        if ('UPDATED_AT' === $field) {
            $qb->addOrderBy('c.updatedAt', $direction);
        }

        if ('POPULARITY' === $field) {
            $qb->addOrderBy('c.votesCount', $direction);
        }

        $qb->setFirstResult($offset)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countCommentsByCommentable(
        CommentableInterface $commentable,
        ?User $viewer = null
    ): int {
        $qb = $this->getByCommentableQueryBuilder($commentable, true, $viewer)->select(
            'count(c.id)'
        );

        return (int) $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult();
    }

    public function countCommentsAndAnswersByCommentable(
        CommentableInterface $commentable,
        ?User $viewer
    ): int {
        $qb = $this->getByCommentableQueryBuilder($commentable, false, $viewer)->select(
            'count(c.id)'
        );

        return (int) $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getSingleScalarResult();
    }

    public function getByProject(
        Project $project,
        int $first = 0,
        int $offset = 100,
        bool $onlyTrashed = false,
        string $field,
        string $direction
    ): Paginator {
        $qb = $this->getQueryCommentWithProject($onlyTrashed)
            ->andWhere('pas.project = :project')
            ->setParameter('project', $project)
            ->setFirstResult($first)
            ->setMaxResults($offset);

            if ('PUBLISHED_AT' === $field) {
                $qb->addOrderBy('c.publishedAt', $direction);
                $qb->addOrderBy('c.createdAt', $direction);
            }
    
            if ('UPDATED_AT' === $field) {
                $qb->addOrderBy('c.updatedAt', $direction);
            }
    
            if ('POPULARITY' === $field) {
                $qb->addOrderBy('c.votesCount', $direction);
            }

        return new Paginator($qb);
    }

    public function countByProject(Project $project, bool $onlyTrashed = false): int
    {
        $query = $this->getQueryCommentWithProject($onlyTrashed)
            ->select('COUNT(c.id)')
            ->andWhere('pas.project = :project')
            ->setParameter('project', $project);

        return $query->getQuery()->getSingleScalarResult();
    }

    protected function getPublishedNotTrashedQueryBuilder(?User $viewer): QueryBuilder
    {
        return $this->getPublishedQueryBuilder($viewer)->andWhere('c.trashedStatus IS NULL');
    }

    protected function getPublishedQueryBuilder(?User $viewer): QueryBuilder
    {
        $qb = $this->createQueryBuilder('c')->orWhere('c.published = true');
        if ($viewer) {
            $qb
                ->orWhere('c.Author = :viewer AND c.published = false')
                ->setParameter('viewer', $viewer);
        }

        return $qb;
    }

    protected function getQueryCommentWithProject(bool $onlyTrashed = false)
    {
        $query = $this->createQueryBuilder('c')
            ->leftJoin('c.proposal', 'p')
            ->leftJoin('p.proposalForm', 'f')
            ->leftJoin('f.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas');

        if ($onlyTrashed) {
            $query = $query->andWhere('c.trashedAt IS NOT NULL')->orderBy('c.trashedAt', 'DESC');
        } else {
            $query = $query->andWhere('c.trashedAt IS NULL')->orderBy('c.publishedAt', 'DESC');
        }

        return $query;
    }

    private function getByCommentableQueryBuilder(
        CommentableInterface $commentable,
        bool $excludeAnswers = true,
        ?User $viewer = null
    ): QueryBuilder {
        $qb = $this->getPublishedNotTrashedQueryBuilder($viewer);
        if ($excludeAnswers && $commentable instanceof Proposal) {
            $qb->andWhere('c.parent is NULL');
        }
        if ($commentable instanceof Proposal) {
            $qb
                ->andWhere('c.proposal = :proposal')
                ->setParameter('proposal', $commentable, Type::GUID);
        }

        if ($commentable instanceof ProposalComment) {
            $qb->andWhere('c.parent = :comment')->setParameter('comment', $commentable, Type::GUID);
        }

        return $qb;
    }
}
