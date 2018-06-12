<?php

namespace Capco\AppBundle\Repository;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

class GroupRepository extends EntityRepository
{
    public function getGroupsByUser(User $user): array
    {
        $qb = $this->createQueryBuilder('g');
        $qb
            ->leftJoin('g.userGroups', 'ug')
            ->andWhere('ug.user = :user')
            ->setParameter('user', $user);

        return $qb->getQuery()->getResult();
    }
}
