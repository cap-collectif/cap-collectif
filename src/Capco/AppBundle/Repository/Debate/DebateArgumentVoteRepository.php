<?php

namespace Capco\AppBundle\Repository\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArgumentVote;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Debate\DebateVote;

/**
 * @method DebateVote|null find($id, $lockMode = null, $lockVersion = null)
 * @method DebateVote|null findOneBy(array $criteria, array $orderBy = null)
 * @method DebateVote[]    findAll()
 * @method DebateVote[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateArgumentVoteRepository extends EntityRepository
{
    public function getOneByDebateArgumentAndUser(
        DebateArgument $debateArgument,
        User $user
    ): ?DebateArgumentVote {
        return $this->getByDebateArgumentQueryBuilder($debateArgument, false)
            ->andWhere('v.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function getByDebateArgument(
        DebateArgument $debateArgument,
        int $limit,
        int $offset,
        array $orderBy
    ): Paginator {
        $qb = $this->getByDebateArgumentQueryBuilder($debateArgument)
            ->addOrderBy('v.' . $orderBy['field'], $orderBy['direction'])
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countByDebateArgument(DebateArgument $debateArgument): int
    {
        return (int) $this->getByDebateArgumentQueryBuilder($debateArgument)
            ->select('COUNT(v)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    private function getByDebateArgumentQueryBuilder(
        DebateArgument $debateArgument,
        bool $onlyPublished = true
    ): QueryBuilder {
        $qb = $this->createQueryBuilder('v')
            ->andWhere('v.debateArgument = :debateArgument')
            ->setParameter('debateArgument', $debateArgument);

        if ($onlyPublished) {
            $qb->andWhere('v.published = true');
        }

        return $qb;
    }
}
