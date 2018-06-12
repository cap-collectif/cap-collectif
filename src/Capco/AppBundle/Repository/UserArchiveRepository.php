<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\UserArchive;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

class UserArchiveRepository extends EntityRepository
{
    public function getLastForUser(User $user): ?UserArchive
    {
        return $this->createQueryBuilder('ua')
            ->andWhere('ua.user = :user')
            ->setParameter('user', $user)
            ->addOrderBy('ua.requestedAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
