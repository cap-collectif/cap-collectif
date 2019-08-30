<?php

namespace Capco\AppBundle\Repository;

use DateInterval;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

class UserConnectionRepository extends EntityRepository
{
    public function findByUserId(string $userId)
    {
        return $this->findByUserRequest($userId)
            ->getQuery()
            ->getResult();
    }

    public function countByUserId(string $userId): int
    {
        $qb = $this->findByUserRequest($userId)->select('count(c)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByUserIdInLastHour(string $userId): int
    {
        $to = new \DateTime();
        $from = new \DateTime();
        $from = $from->sub(DateInterval::createFromDateString('+1 hour'));
        $qb = $this->findByUserRequest($userId)
            ->andWhere('c.datetime BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->select('count(c)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countFailedAttemptByEmailInLastHour(string $email): int
    {
        $to = new \DateTime();
        $from = new \DateTime();
        $from = $from->sub(DateInterval::createFromDateString('+1 hour'));
        $qb = $this->createQueryBuilder('c')
            ->where('c.email = :email')
            ->setParameter('email', $email)
            ->andWhere('c.datetime BETWEEN :from AND :to')
            ->andWhere('c.success = false')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->select('count(c)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    private function findByUserRequest(string $userId): QueryBuilder
    {
        return $this->createQueryBuilder('c')
            ->where('c.userId = :userId')
            ->setParameter('userId', $userId);
    }
}
