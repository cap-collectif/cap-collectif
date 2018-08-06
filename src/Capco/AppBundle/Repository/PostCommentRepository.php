<?php
namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Post;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

class PostCommentRepository extends EntityRepository
{
    public function getEnabledByPost($post, $offset = 0, $limit = 10, $filter = 'last')
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'p', 'r', 'ans')
            ->leftJoin('c.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('c.votes', 'v')
            ->leftJoin('c.Reports', 'r')
            ->leftJoin('c.post', 'p')
            ->leftJoin('c.answers', 'ans', 'WITH', 'ans.published = true AND ans.trashedAt IS NULL')
            ->andWhere('c.post = :post')
            ->andWhere('c.parent is NULL')
            ->andWhere('c.trashedAt IS NULL')
            ->setParameter('post', $post)
            ->orderBy('c.pinned', 'DESC');
        if ('old' === $filter) {
            $qb->addOrderBy('c.updatedAt', 'ASC');
        }

        if ('last' === $filter) {
            $qb->addOrderBy('c.updatedAt', 'DESC');
        }

        if ('popular' === $filter) {
            $qb->addOrderBy('c.votesCount', 'DESC');
        }

        $qb->setFirstResult($offset)->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function getAllByPost(
        Post $post,
        ?int $limit = null,
        string $field,
        int $offset = 0,
        string $direction = 'ASC'
    ): Paginator {
        $qb = $this->createQueryBuilder('c')
            ->andWhere('c.post = :post')
            ->andWhere('c.parent is NULL')
            ->setParameter('post', $post)
            ->orderBy('c.pinned', 'DESC');
        if ('CREATED_AT' === $field) {
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

    public function countCommentsAndAnswersEnabledByPost($post)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('count(c.id)')
            ->andWhere('c.post = :post')
            ->andWhere('c.trashedStatus IS NULL')
            ->setParameter('post', $post);
        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countAllCommentsAndAnswersByPost(Post $post): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('count(c.id)')
            ->andWhere('c.post = :post')
            ->setParameter('post', $post);
        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('c')->andWhere('c.published = true');
    }
}
