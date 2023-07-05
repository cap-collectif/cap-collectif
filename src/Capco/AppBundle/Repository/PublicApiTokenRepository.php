<?php

namespace Capco\AppBundle\Repository;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

class PublicApiTokenRepository extends EntityRepository
{
    public function findPublicApiTokensByUser(User $user): iterable
    {
        return $this->createQueryBuilder('t')
            ->where('t.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult()
        ;
    }
}
