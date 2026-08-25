<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SocialNetwork;
use Doctrine\ORM\EntityRepository;

/**
 * SocialNetworkRepository.
 */
class SocialNetworkRepository extends EntityRepository
{
    /**
     * get all social network enabled.
     *
     * @return array
     */
    public function getEnabled()
    {
        $qb = $this->createQueryBuilder('s')
            ->leftJoin('s.media', 'm')
            ->addSelect('m')
            ->andWhere('s.isEnabled = :isEnabled')
            ->addOrderBy('s.position', 'ASC')
            ->setParameter('isEnabled', true)
        ;

        return $qb->getQuery()->getResult();
    }

    /**
     * @return SocialNetwork[]
     */
    public function getPaginated(?int $offset = null, ?int $limit = null): array
    {
        $queryBuilder = $this->createQueryBuilder('s')
            ->orderBy('s.position', 'ASC')
        ;

        if (null !== $offset) {
            $queryBuilder->setFirstResult($offset);
        }

        if (null !== $limit) {
            $queryBuilder->setMaxResults($limit);
        }

        return $queryBuilder->getQuery()->getResult();
    }

    public function countAll(): int
    {
        return (int) $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }
}
