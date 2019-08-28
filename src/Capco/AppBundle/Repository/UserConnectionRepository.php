<?php

namespace Capco\AppBundle\Repository;

use DateInterval;
use Doctrine\ORM\EntityRepository;

class UserConnectionRepository extends EntityRepository
{
    public function findByEmail(string $email)
    {
        return $this->findBy(['email' => $email]);
    }

    public function countByEmail(string $email)
    {
        $qb = $this->createQueryBuilder('c')
            ->where('c.email = :email')
            ->setParameter('email', $email)
            ->select('count(c)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByEmailInLastHour(string $email)
    {
        $to = new \DateTime();
        $from = new \DateTime();
        $from = $from->sub(DateInterval::createFromDateString('+1 hour'));
        $qb = $this->createQueryBuilder('c')
            ->where('c.email = :email')
            ->andWhere('c.datetime BETWEEN :from AND :to')
            ->andWhere('c.success = false')
            ->setParameter('email', $email)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->select('count(c)');

        return $qb->getQuery()->getSingleScalarResult();
    }
}
