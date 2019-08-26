<?php

namespace Capco\AppBundle\Repository;

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
}
