<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\UserGroup;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

class UserGroupRepository extends EntityRepository
{
    public function countAllByUser(User $user): int
    {
        $qb = $this->createQueryBuilder('ug');
        $qb->select('count(DISTINCT ug)')
            ->andWhere('ug.user = :user')
            ->setParameter('user', $user)
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @return UserGroup[]
     */
    public function findAllUserGroupsPaginated(int $offset = 0, int $limit = 100): array
    {
        $qb = $this->createQueryBuilder('ug')
            ->leftJoin('ug.group', 'g')
            ->leftJoin('ug.user', 'u')
            ->groupBy('g.id')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
    ;

        return $qb->getQuery()->getResult();
    }

    /**
     * @param string[] $userIds
     *
     * @return UserGroup[]
     */
    public function findUsersByGroup(array $userIds, string $groupId): array
    {
        $qb = $this->createQueryBuilder('ug')
            ->where('ug.user IN (:users)')
            ->andWhere('ug.group = :groupId')
            ->setParameters([
                'users' => $userIds,
                'groupId' => $groupId,
            ])
        ;

        return $qb->getQuery()->getResult();
    }
}
