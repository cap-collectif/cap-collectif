<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\VocalContribution;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|VocalContribution find($id, $lockMode = null, $lockVersion = null)
 * @method null|VocalContribution findOneBy(array<mixed> $criteria, array<null|string> $orderBy = null)
 * @method VocalContribution[]    findAll()
 * @method VocalContribution[]    findBy(array<mixed> $criteria, array<null|string> $orderBy = null, $limit = null, $offset = null)
 */
class VocalContributionRepository extends EntityRepository
{
    /**
     * @return array<int, VocalContribution>
     */
    public function findForAdmin(?string $status, int $offset, int $limit): array
    {
        $queryBuilder = $this->createQueryBuilder('v')
            ->leftJoin('v.user', 'u')->addSelect('u')
            ->leftJoin('v.participant', 'p')->addSelect('p')
            ->leftJoin('v.media', 'm')->addSelect('m')
            ->orderBy('v.createdAt', 'DESC')
            ->addOrderBy('v.id', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;

        if (null !== $status) {
            $queryBuilder
                ->andWhere('v.completionStatus = :status')
                ->setParameter('status', $status)
            ;
        }

        return $queryBuilder->getQuery()->getResult();
    }

    public function countForAdmin(?string $status): int
    {
        $queryBuilder = $this->createQueryBuilder('v')
            ->select('COUNT(v.id)')
        ;

        if (null !== $status) {
            $queryBuilder
                ->andWhere('v.completionStatus = :status')
                ->setParameter('status', $status)
            ;
        }

        return (int) $queryBuilder->getQuery()->getSingleScalarResult();
    }
}
