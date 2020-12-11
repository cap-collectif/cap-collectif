<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Model\Contribution;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ReportingRepository extends EntityRepository
{
    public function getByProposal(
        Proposal $proposal,
        int $offset,
        int $limit,
        string $field,
        string $direction
    ): Paginator {
        $qb = $this->createQueryBuilder('r');

        $qb->andWhere('r.proposal = :proposal')
            ->setParameter('proposal', $proposal)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('r.createdAt', $direction);
        }

        return new Paginator($qb);
    }

    public function countAllByUser(User $user): int
    {
        $qb = $this->createQueryBuilder('r');
        $qb->select('count(DISTINCT r)')
            ->andWhere('r.Reporter = :user')
            ->setParameter('user', $user);

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findAllByUser(User $user): array
    {
        $qb = $this->createQueryBuilder('r');
        $qb->andWhere('r.Reporter = :user')->setParameter('user', $user);

        return $qb->getQuery()->getResult();
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

    public function getByComment(
        Comment $comment,
        int $offset,
        int $limit,
        string $field,
        string $direction
    ): Paginator {
        $qb = $this->createQueryBuilder('r');

        $qb->andWhere('r.Comment = :comment')
            ->setParameter('comment', $comment)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('r.createdAt', $direction);
        }

        return new Paginator($qb);
    }

    public function getByOpinion(
        Opinion $opinion,
        int $offset,
        int $limit,
        string $field,
        string $direction
    ): Paginator {
        $qb = $this->createQueryBuilder('r');

        $qb->andWhere('r.Opinion = :opinion')
            ->setParameter('opinion', $opinion)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('r.createdAt', $direction);
        }

        return new Paginator($qb);
    }

    public function countForOpinion(Opinion $opinion): int
    {
        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.Opinion = :opinion')
            ->setParameter('opinion', $opinion)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getByOpinionVersion(
        OpinionVersion $opinionVersion,
        int $offset,
        int $limit,
        string $field,
        string $direction
    ): Paginator {
        $qb = $this->createQueryBuilder('r');

        $qb->andWhere('r.opinionVersion = :opinionVersion')
            ->setParameter('opinionVersion', $opinionVersion)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('r.createdAt', $direction);
        }

        return new Paginator($qb);
    }

    public function countForOpinionVersion(OpinionVersion $opinionVersion): int
    {
        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.opinionVersion = :opinionVersion')
            ->setParameter('opinionVersion', $opinionVersion)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getByDebateArgument(
        DebateArgument $debateArgument,
        int $offset,
        int $limit,
        string $field,
        string $direction
    ): Paginator {
        $qb = $this->createQueryBuilder('r');

        $qb->andWhere('r.debateArgument = :debateArgument')
            ->setParameter('debateArgument', $debateArgument)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('r.createdAt', $direction);
        }

        return new Paginator($qb);
    }

    public function countForDebateArgument(DebateArgument $debateArgument): int
    {
        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.debateArgument = :debateArgument')
            ->setParameter('debateArgument', $debateArgument)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getRecentOrdered(): array
    {
        $qb = $this->createQueryBuilder('r')
            ->select('r, u, o, ov, s, a, c, p')
            ->leftJoin('r.Reporter', 'u')
            ->leftJoin('r.Opinion', 'o')
            ->leftJoin('r.opinionVersion', 'ov')
            ->leftJoin('r.Source', 's')
            ->leftJoin('r.Argument', 'a')
            ->leftJoin('r.Comment', 'c')
            ->leftJoin('r.proposal', 'p')
            ->addOrderBy('r.createdAt', 'DESC');

        return $qb->getQuery()->execute();
    }

    public function getByContributionType(
        Contribution $contribution,
        string $contributionType,
        int $offset,
        int $limit,
        string $field,
        string $direction
    ): Paginator {
        $qb = $this->createQueryBuilder('r');

        $qb->andWhere("r.${contributionType} = :contribution")
            ->setParameter('contribution', $contribution)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ('PUBLISHED_AT' === $field) {
            $qb->addOrderBy('r.createdAt', $direction);
        }

        return new Paginator($qb);
    }

    public function countForContributionType(
        Contribution $contribution,
        string $contributionType
    ): int {
        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->andWhere("r.${contributionType} = :contribution")
            ->setParameter('contribution', $contribution)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
