<?php

namespace Capco\AppBundle\Repository\Debate;

use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgumentVote;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @method null|DebateVote find($id, $lockMode = null, $lockVersion = null)
 * @method null|DebateVote findOneBy(array $criteria, array $orderBy = null)
 * @method DebateVote[]    findAll()
 * @method DebateVote[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DebateAnonymousArgumentVoteRepository extends EntityRepository
{
    public function getOneByDebateArgumentAndUser(
        DebateAnonymousArgument $debateArgument,
        User $user
    ): ?DebateAnonymousArgumentVote {
        return $this->getByDebateArgumentQueryBuilder($debateArgument, false)
            ->andWhere('v.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function getByDebateArgument(
        DebateAnonymousArgument $debateArgument,
        int $limit,
        int $offset,
        array $orderBy
    ): Paginator {
        $qb = $this->getByDebateArgumentQueryBuilder($debateArgument)
            ->addOrderBy('v.' . $orderBy['field'], $orderBy['direction'])
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;

        return new Paginator($qb);
    }

    public function countByDebateArgument(DebateAnonymousArgument $debateArgument): int
    {
        return (int) $this->getByDebateArgumentQueryBuilder($debateArgument)
            ->select('COUNT(v)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    private function getByDebateArgumentQueryBuilder(
        DebateAnonymousArgument $debateArgument,
        bool $onlyPublished = true
    ): QueryBuilder {
        $qb = $this->createQueryBuilder('v')
            ->andWhere('v.debateAnonymousArgument = :debateArgument')
            ->setParameter('debateArgument', $debateArgument)
        ;

        if ($onlyPublished) {
            $qb->andWhere('v.published = true');
        }

        return $qb;
    }
}
