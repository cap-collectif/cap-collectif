<?php

namespace Capco\AppBundle\Repository;

use DateInterval;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use http\QueryString;

class UserConnectionRepository extends EntityRepository
{

    private function findByUserRequest(string $userId): QueryBuilder
    {
        return $this->createQueryBuilder('c')
            ->where('c.userId = :userId')
            ->setParameter('userId', $userId);
    }

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

    private function findByAttemptRequest(string $email, bool $successful, bool $lastHour): QueryBuilder{
        $qb = $this->createQueryBuilder('c')
            ->where('c.email = :email')
            ->setParameter('email', $email)
            ->andWhere('c.success = :successful')
            ->setParameter('successful', $successful);
            if ($lastHour){
                $to = new \DateTime();
                $from = new \DateTime();
                $from = $from->sub(DateInterval::createFromDateString('+1 hour'));
                $qb->andWhere('c.datetime BETWEEN :from AND :to')
                    ->setParameter('from', $from)
                    ->setParameter('to', $to);
            }
        return $qb;
    }

    public function findAttemptByEmail(string $email, bool $successful = false, bool $lastHour = true)
    {
        return $this->findByAttemptRequest($email, $successful, $lastHour)->getQuery()->getResult();
    }

    public function countAttemptByEmail(string $email, bool $successful = false, bool $lastHour = true): int
    {
        $qb = $this->findByAttemptRequest($email, $successful, $lastHour)
            ->select('count(c)');
        return $qb->getQuery()->getSingleScalarResult();
    }


}
