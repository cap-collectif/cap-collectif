<?php

namespace Capco\AppBundle\Repository;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Capco\AppBundle\Enum\VoteOrderField;
use Capco\AppBundle\Entity\Debate\Debate;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Debate\DebateVote;

/**
 * @method DebateVote|null find($id, $lockMode = null, $lockVersion = null)
 * @method DebateVote|null findOneBy(array $criteria, array $orderBy = null)
 * @method DebateVote[]    findAll()
 * @method DebateVote[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateVoteRepository extends EntityRepository
{
    public function getOneByDebateAndUser(Debate $debate, User $user): ?DebateVote
    {
        $qb = $this->createQueryBuilder('v')
            ->andWhere('v.debate = :debate')
            ->andWhere('v.user = :user')
            ->setParameter('debate', $debate)
            ->setParameter('user', $user);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getByDebate(
        Debate $debate,
        int $limit,
        int $offset,
        ?int $filterByValue,
        array $orderBy
    ): Paginator {
        $qb = $this->getByDebateAndValueQB($debate, $filterByValue);

        if (VoteOrderField::PUBLISHED_AT === $orderBy['field']) {
            $qb->addOrderBy('v.publishedAt', $orderBy['direction']);
        }

        if (VoteOrderField::CREATED_AT === $orderBy['field']) {
            $qb->addOrderBy('v.createdAt', $orderBy['direction']);
        }

        $qb->setFirstResult($offset);
        $qb->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countByDebate(Debate $debate, ?int $filterByValue = null): int
    {
        $qb = $this->getByDebateAndValueQB($debate, $filterByValue)->select('COUNT(v)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    private function getByDebateAndValueQB(Debate $debate, ?int $filterByValue = null): QueryBuilder
    {
        $qb = $this->getByDebateQB($debate);

        if (0 === $filterByValue || 1 === $filterByValue) {
            $qb->andWhere('v.yesNoValue = :value')->setParameter('value', $filterByValue);
        }

        return $qb;
    }

    private function getByDebateQB(Debate $debate): QueryBuilder
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.published = true')
            ->andWhere('v.debate = :debate')
            ->setParameter('debate', $debate);
    }
}
