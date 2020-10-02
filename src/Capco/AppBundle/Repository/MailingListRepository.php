<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\MailingList;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

/**
 * @method MailingList|null find($id, $lockMode = null, $lockVersion = null)
 * @method MailingList|null findOneBy(array $criteria, array $orderBy = null)
 * @method MailingList[]    findAll()
 * @method MailingList[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MailingListRepository extends EntityRepository
{
    public function findPaginated(?int $limit, ?int $offset): array
    {
        return $this->createQueryBuilder('ml')
            ->setFirstResult($offset ?? 0)
            ->setMaxResults($limit ?? 50)
            ->addOrderBy('ml.id')
            ->getQuery()
            ->getResult();
    }

    public function getMailingListByUser(User $user): array
    {
        return $qb = $this->createQueryBuilder('ml')
            ->where(':user MEMBER OF ml.users')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }
}
