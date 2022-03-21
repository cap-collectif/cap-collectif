<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SmsOrder;
use Doctrine\ORM\EntityRepository;

/**
 * @method SmsOrder|null find($id, $lockMode = null, $lockVersion = null)
 * @method SmsOrder|null findOneBy(array $criteria, array $orderBy = null)
 * @method SmsOrder[]    findAll()
 * @method SmsOrder[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SmsOrderRepository extends EntityRepository
{

    public function findNotProcessedPaginated(int $offset, int $limit): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.isProcessed = false')
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
}
