<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * AbstractVoteRepository.
 */
class AbstractVoteRepository extends EntityRepository
{
    /**
     * Get one vote by id.
     *
     * @param $vote
     *
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneById($id)
    {
        return $this->getIsConfirmedQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'r')
            ->leftJoin('v.user', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->andWhere('v.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Get votes by user.
     *
     * @param user
     *
     * @return mixed
     */
    public function getByUser($user)
    {
        $qb = $this->getIsConfirmedQueryBuilder()
            ->addSelect('u', 'm')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.Media', 'm')
            ->andWhere('v.user = :user')
            ->setParameter('user', $user)
            ->orderBy('v.updatedAt', 'ASC');

        return $qb
            ->getQuery()
            ->execute();
    }

    protected function getIsConfirmedQueryBuilder()
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.confirmed = :confirmed')
            ->setParameter('confirmed', true);
    }
}
