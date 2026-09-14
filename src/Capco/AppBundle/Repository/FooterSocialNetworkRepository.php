<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\FooterSocialNetwork;
use Doctrine\ORM\EntityRepository;

/**
 * FooterSocialNetworkRepository.
 */
class FooterSocialNetworkRepository extends EntityRepository
{
    public static function getEnabledCacheKey()
    {
        return 'FooterSocialNetworkRepository_getEnabled_resultcache_';
    }

    public function getEnabled(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select('s.title, s.link, s.style')
            ->andWhere('s.isEnabled = :enabled')
            ->addOrderBy('s.position', 'ASC')
            ->setParameter('enabled', true)
        ;

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->enableResultCache(60, self::getEnabledCacheKey())
            ->getArrayResult()
        ;
    }

    public function countAll(): int
    {
        return (int) $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function getNextPosition(): int
    {
        $maxPosition = $this->createQueryBuilder('s')
            ->select('MAX(s.position)')
            ->getQuery()
            ->getSingleScalarResult()
        ;

        return null === $maxPosition ? 0 : ((int) $maxPosition + 1);
    }

    /**
     * @return FooterSocialNetwork[]
     */
    public function getWithPagination(?int $offset = null, ?int $limit = null): array
    {
        $qb = $this->createQueryBuilder('s')->addOrderBy('s.position', 'ASC');

        if (null !== $offset) {
            $qb->setFirstResult($offset);
        }

        if (null !== $limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getResult();
    }
}
