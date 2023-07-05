<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\Enum\SmsOrdersFilters;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|SmsOrder find($id, $lockMode = null, $lockVersion = null)
 * @method null|SmsOrder findOneBy(array $criteria, array $orderBy = null)
 * @method SmsOrder[]    findAll()
 * @method SmsOrder[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SmsOrderRepository extends EntityRepository
{
    public function findPaginated(int $offset, int $limit, ?string $filter = null): array
    {
        $qb = $this->createQueryBuilder('s')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;

        if (SmsOrdersFilters::PROCESSED === $filter || SmsOrdersFilters::UNPROCESSED === $filter) {
            $filterValue = SmsOrdersFilters::PROCESSED === $filter;
            $qb->where('s.isProcessed = :isProcessed');
            $qb->setParameter('isProcessed', $filterValue);
        }

        return $qb
            ->getQuery()->getResult();
    }

    public function countAll(?string $filter = null): int
    {
        $qb = $this->createQueryBuilder('s')
            ->select('count(s.id)')
        ;

        if (SmsOrdersFilters::PROCESSED === $filter || SmsOrdersFilters::UNPROCESSED === $filter) {
            $filterValue = SmsOrdersFilters::PROCESSED === $filter;
            $qb->where('s.isProcessed = :isProcessed');
            $qb->setParameter('isProcessed', $filterValue);
        }

        return $qb->getQuery()->getSingleScalarResult();
    }
}
