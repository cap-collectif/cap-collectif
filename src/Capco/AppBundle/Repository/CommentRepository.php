<?php

namespace Capco\AppBundle\Repository;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\Query\ResultSetMapping;

class CommentRepository extends EntityRepository
{
    public function countPublished(): int
    {
        $qb = $this->createQueryBuilder('c')
            ->select('count(DISTINCT c.id)')
            ->where('c.published = true');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getAnonymousCount(): int
    {
        $qb = $this->createQueryBuilder('c')
            ->select('count(DISTINCT c.authorEmail)')
            ->where('c.Author IS NULL');

        return $qb->getQuery()->getSingleScalarResult();
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
            ->leftJoin('c.Author', 'a');

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
            ->leftJoin('c.Author', 'a')
            ->where('c.id = :id')
            ->setParameter('id', $id);

        return $qb->getQuery()->getOneOrNullResult(Query::HYDRATE_ARRAY);
    }

    public function getOneById($comment)
    {
        return $this->getPublishedQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'r')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('c.votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->andWhere('c.id = :comment')
            ->setParameter('comment', $comment)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countAllByAuthor(User $user): int
    {
        return $this->getPublishedQueryBuilder()
            ->select('COUNT(c)')
            ->andWhere('c.Author = :author')
            ->setParameter('author', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findAllByAuthor(User $user): array
    {
        $qb = $this->createQueryBuilder('c');
        $qb->andWhere('c.Author = :author')->setParameter('author', $user);

        return $qb->getQuery()->getResult();
    }

    /**
     * Get comments by user.
     *
     * @param mixed    $user
     * @param int|null $limit
     * @param int|null $offset
     *
     * @return mixed
     */
    public function getByUser($user, int $limit = null, int $offset = null)
    {
        $qb = $this->getPublishedQueryBuilder()
            ->addSelect('a', 'm')
            ->leftJoin('c.Author', 'a')
            ->leftJoin('a.media', 'm')
            ->andWhere('c.Author = :user')
            ->setParameter('user', $user)
            ->orderBy('c.updatedAt', 'ASC')
            ->setMaxResults($limit)
            ->setFirstResult($offset);

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
            ->setParameter('userId', $user->getId());

        return (int) $query->getSingleScalarResult();
    }

    protected function getPublishedQueryBuilder()
    {
        return $this->createQueryBuilder('c')->andWhere('c.published = true');
    }
}
