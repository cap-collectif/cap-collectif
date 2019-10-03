<?php

namespace Capco\AppBundle\Repository;

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

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function countFailedAttemptByEmailInLastHour(string $email): int
    {
        return $this->countAttemptByEmail($email, false, true);
    }

    public function countFailedAttemptByEmailAndIPInLastHour(string $email, string $ip): int
    {
        $qb = $this->createQueryBuilder('c')
            ->select('count(c)')
            ->andWhere('c.email = :email')
            ->andWhere('c.success = :successful')
            ->andWhere('c.ipAddress = :ip')
            ->setParameter('email', $email)
            ->setParameter('ip', $ip)
            ->setParameter('successful', false)
            ->orderBy(self::ORDER_BY_COL, self::ORDER_BY_DIR)
            ->andWhere('c.datetime BETWEEN :from AND :to')
            ->setParameter('from', new \DateTime('-1 hour'))
            ->setParameter('to', new \DateTime());

        return (int) $qb->getQuery()->getSingleScalarResult();
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
            ->andWhere('c.email = :email')
            ->andWhere('c.success = :successful')
            ->setParameter('email', $email)
            ->setParameter('successful', $successful)
            ->orderBy(self::ORDER_BY_COL, self::ORDER_BY_DIR);
        if ($lastHour) {
            $qb
                ->andWhere('c.datetime BETWEEN :from AND :to')
                ->setParameter('from', new \DateTime('-1 hour'))
                ->setParameter('to', new \DateTime());
        }

        return $qb;
    }
}
