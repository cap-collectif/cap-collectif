<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SmsCredit;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|SmsCredit find($id, $lockMode = null, $lockVersion = null)
 * @method null|SmsCredit findOneBy(array $criteria, array $orderBy = null)
 * @method SmsCredit[]    findAll()
 * @method SmsCredit[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SmsCreditRepository extends EntityRepository
{
    public function findPaginated(int $offset, int $limit): array
    {
        return $this->createQueryBuilder('s')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()->getResult();
    }

    public function countAll(): int
    {
        return (int) $this->createQueryBuilder('s')
            ->select('count(s.id)')
            ->getQuery()->getSingleScalarResult();
    }

    public function sumAll(): int
    {
        return (int) $this->createQueryBuilder('s')
            ->select('sum(s.amount)')
            ->getQuery()->getSingleScalarResult();
    }

    public function findMostRecent(): ?SmsCredit
    {
        return $this->createQueryBuilder('s')
            ->orderBy('s.createdAt', 'DESC')
            ->getQuery()
            ->setMaxResults(1)
            ->getOneOrNullResult()
        ;
    }
}
