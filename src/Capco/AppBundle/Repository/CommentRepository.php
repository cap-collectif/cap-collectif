<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Enum\CommentOrderField;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\Query;
use Doctrine\ORM\Query\ResultSetMapping;

class CommentRepository extends EntityRepository
{
    use ContributionRepositoryTrait;

    /**
     * @return array<int, string>
     */
    public function findPaginated(
        ?string $search,
        ?string $field = CommentOrderField::CREATED_AT,
        ?string $direction = 'ASC',
        int $offset = 0,
        int $limit = 50
    ): array {
        $qb = $this->createQueryBuilder('c')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;
        if (CommentOrderField::CREATED_AT === $field) {
            $qb->addOrderBy('c.createdAt', $direction);
        }
        if (CommentOrderField::UPDATED_AT === $field) {
            $qb->addOrderBy('c.updatedAt', $direction);
        }
        if ($search) {
            $alias = $qb->getRootAliases()[0];
            $this->searchByBodyOrAuthorUsername($qb, $search, $alias);
        }

        return $qb->getQuery()->getResult();
    }

    public function countPublished(): int
    {
        $qb = $this->createQueryBuilder('c')
            ->select('count(DISTINCT c.id)')
            ->where('c.published = true')
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getAnonymousCount(): int
    {
        $qb = $this->createQueryBuilder('c')
            ->select('count(DISTINCT c.authorEmail)')
            ->where('c.author IS NULL')
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @throws NonUniqueResultException
     * @throws NoResultException
     */
    public function getTotalCommentsBySearchQuery(
        ?string $search = null
    ): int {
        $qb = $this->createQueryBuilder('c');
        if ($search) {
            $this->searchByBodyOrAuthorUsername($qb, $search, 'c');
        }
        $qb->select('COUNT(c.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getRecentOrdered()
    {
        $qb = $this->createQueryBuilder('c')
            ->select(
                'c.id',
                'c.createdAt',
                'c.updatedAt',
                'a.username as author',
                'c.published',
                'c.trashedAt as trashed'
            )
            ->leftJoin('c.author', 'a')
        ;

        return $qb->getQuery()->getArrayResult();
    }

    public function getArrayById($id)
    {
        $qb = $this->createQueryBuilder('c')
            ->select(
                'c.id',
                'c.createdAt',
                'c.updatedAt',
                'a.username as author',
                'c.published',
                'c.trashedAt as trashed',
                'c.body as body'
            )
            ->leftJoin('c.author', 'a')
            ->where('c.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb->getQuery()->getOneOrNullResult(Query::HYDRATE_ARRAY);
    }

    public function getOneById($comment)
    {
        return $this->getPublishedQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'r')
            ->leftJoin('c.author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('c.votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->andWhere('c.id = :comment')
            ->setParameter('comment', $comment)
            ->getQuery()
            ->getOneOrNullResult()
            ;
    }

    public function countAllByAuthor(User $user): int
    {
        return $this->getPublishedQueryBuilder()
            ->select('COUNT(c)')
            ->andWhere('c.author = :author')
            ->setParameter('author', $user)
            ->getQuery()
            ->getSingleScalarResult()
            ;
    }

    public function findAllByAuthor(User $user): array
    {
        $qb = $this->createQueryBuilder('c');
        $qb->andWhere('c.author = :author')->setParameter('author', $user);

        return $qb->getQuery()->getResult();
    }

    /**
     * Get comments by user.
     *
     * @return mixed
     */
    public function getByUser(mixed $user, ?int $limit = null, ?int $offset = null)
    {
        $qb = $this->getPublishedQueryBuilder()
            ->addSelect('a', 'm')
            ->leftJoin('c.author', 'a')
            ->leftJoin('a.media', 'm')
            ->andWhere('c.author = :user')
            ->setParameter('user', $user)
            ->orderBy('c.updatedAt', 'ASC')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
        ;

        return $qb->getQuery()->execute();
    }

    public function getPublishedWith($from = null, $to = null)
    {
        $qb = $this->getPublishedQueryBuilder();

        if ($from) {
            $qb->andWhere('c.createdAt >= :from')->setParameter('from', $from);
        }

        if ($to) {
            $qb->andWhere('c.createdAt <= :to')->setParameter('to', $to);
        }

        return $qb->getQuery()->getResult();
    }

    public function getEventCommentsCount(User $user): int
    {
        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('sclr', 'sclr');

        $query = $this->getEntityManager()
            ->createNativeQuery(
                '
            SELECT count(c.id) AS sclr FROM comment c USE INDEX (comment_idx_published_id_id)
            INNER JOIN event e ON c.event_id = e.id
            WHERE c.author_id = :userId AND c.published = 1 AND e.is_enabled = 1',
                $rsm
            )
            ->setParameter('userId', $user->getId())
        ;

        return (int) $query->getSingleScalarResult();
    }

    public function hydrateFromIds(array $ids): array
    {
        $qb = $this->createQueryBuilder('c');
        $qb->where('c.id IN (:ids)')->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    protected function getPublishedQueryBuilder()
    {
        return $this->createQueryBuilder('c')->andWhere('c.published = true');
    }
}
