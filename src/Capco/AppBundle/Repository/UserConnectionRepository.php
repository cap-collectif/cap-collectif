<?php

namespace Capco\AppBundle\Repository;

use DateInterval;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

class UserConnectionRepository extends EntityRepository
{
    public const ORDER_BY_COL = 'c.datetime';

    public const ORDER_BY_DIR = 'ASC';

    public function findByUserId(string $userId): array
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

    public function findAttemptByEmail(
        string $email,
        int $offset,
        int $limit,
        bool $successful = false,
        bool $lastHour = true
    ): array {
        return $this->findByAttemptRequest($email, $successful, $lastHour)
            ->getQuery()
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getResult();
    }

    public function countAttemptByEmail(
        string $email,
        bool $successful = false,
        bool $lastHour = true
    ): int {
        $qb = $this->findByAttemptRequest($email, $successful, $lastHour)->select('count(c)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countFailedAttemptByEmailInLastHour(string $email): int
    {
        return $this->countAttemptByEmail($email, false);
    }

    private function findByUserRequest(string $userId): QueryBuilder
    {
        return $this->createQueryBuilder('c')
            ->where('c.user = :user')
            ->setParameter('user', $userId)
            ->orderBy(self::ORDER_BY_COL, self::ORDER_BY_DIR);
    }

    private function findByAttemptRequest(
        string $email,
        bool $successful,
        bool $lastHour
    ): QueryBuilder {
        $qb = $this->createQueryBuilder('c')
            ->where('c.email = :email')
            ->setParameter('email', $email)
            ->andWhere('c.success = :successful')
            ->setParameter('successful', $successful)
            ->orderBy(self::ORDER_BY_COL, self::ORDER_BY_DIR);
        if ($lastHour) {
            $to = new \DateTime();
            $from = new \DateTime();
            $from = $from->sub(DateInterval::createFromDateString('+1 hour'));
            $qb
                ->andWhere('c.datetime BETWEEN :from AND :to')
                ->setParameter('from', $from)
                ->setParameter('to', $to);
        }

        return $qb;
    }
}
