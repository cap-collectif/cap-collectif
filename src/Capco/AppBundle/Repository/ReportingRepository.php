<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Proposal;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ReportingRepository extends EntityRepository
{
    public function getByProposal(Proposal $proposal, int $offset, int $limit, string $field, string $direction): Paginator
    {
        $qb = $this->createQueryBuilder('r');

        $qb->andWhere('r.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ('CREATED_AT' === $field) {
            $qb->addOrderBy('r.createdAt', $direction);
        }

        return new Paginator($qb);
    }

    public function countForProposal(Proposal $proposal): int
    {
        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countForComment(Comment $comment): int
    {
        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.Comment = :comment')
            ->setParameter('comment', $comment)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getByComment(Comment $comment, int $offset, int $limit, string $field, string $direction): Paginator
    {
        $qb = $this->createQueryBuilder('r');

        $qb->andWhere('r.Comment = :comment')
            ->setParameter('comment', $comment)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ('CREATED_AT' === $field) {
            $qb->addOrderBy('r.createdAt', $direction);
        }

        return new Paginator($qb);
    }

    public function getRecentOrdered()
    {
        $qb = $this->createQueryBuilder('r')
            ->select('r, u, o, ov, s, a, i, c, p')
            ->leftJoin('r.Reporter', 'u')
            ->leftJoin('r.Opinion', 'o')
            ->leftJoin('r.opinionVersion', 'ov')
            ->leftJoin('r.Source', 's')
            ->leftJoin('r.Argument', 'a')
            ->leftJoin('r.Idea', 'i')
            ->leftJoin('r.Comment', 'c')
            ->leftJoin('r.proposal', 'p')
            ->addOrderBy('r.createdAt', 'DESC')
        ;

        return $qb->getQuery()
            ->execute()
            ;
    }
}
