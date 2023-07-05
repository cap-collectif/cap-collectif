<?php

namespace Capco\AppBundle\Repository;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

class UserArchiveRepository extends EntityRepository
{
    public function getLastForUser(User $user)
    {
        return $this->createQueryBuilder('ua')
            ->andWhere('ua.user = :user')
            ->setParameter('user', $user)
            ->addOrderBy('ua.requestedAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function getArchivesToDelete(\DateTime $date): array
    {
        return $this->createQueryBuilder('ua')
            ->andWhere('ua.requestedAt <= :date')
            ->andWhere('ua.ready = 1')
            ->andWhere('ua.deletedAt IS NULL')
            ->setParameter('date', $date)
            ->getQuery()
            ->execute()
        ;
    }
}
