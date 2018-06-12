<?php

namespace Capco\AppBundle\Repository;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

class UserGroupRepository extends EntityRepository
{
    public function countAllByUser(User $user): int
    {
        $qb = $this->createQueryBuilder('ug');
        $qb
            ->select('count(DISTINCT ug)')
            ->andWhere('ug.user = :user')
            ->setParameter('user', $user)
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }
}
