<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\HttpRedirect;
use Doctrine\ORM\EntityRepository;

class HttpRedirectRepository extends EntityRepository
{
    /**
     * @return HttpRedirect[]
     */
    public function getPaginated(?int $offset = null, ?int $limit = null): array
    {
        $queryBuilder = $this->createQueryBuilder('redirect')
            ->orderBy('redirect.createdAt', 'DESC')
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
        return (int) $this->createQueryBuilder('redirect')
            ->select('COUNT(redirect.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function findMatching(string $pathWithoutQuery, ?string $pathWithQuery = null): ?HttpRedirect
    {
        $candidates = array_values(array_filter([$pathWithQuery, $pathWithoutQuery]));
        if (empty($candidates)) {
            return null;
        }

        $queryBuilder = $this->createQueryBuilder('redirect')
            ->andWhere('redirect.sourceUrl IN (:candidates)')
            ->setParameter('candidates', $candidates)
            ->setMaxResults(1)
        ;

        if ($pathWithQuery) {
            $queryBuilder
                ->addSelect('CASE WHEN redirect.sourceUrl = :pathWithQuery THEN 1 ELSE 0 END AS HIDDEN orderByQuery')
                ->setParameter('pathWithQuery', $pathWithQuery)
                ->orderBy('orderByQuery', 'DESC')
            ;
        }

        return $queryBuilder->getQuery()->getOneOrNullResult();
    }

    public function isSourceUrlUsed(string $sourceUrl, ?string $excludeId = null): bool
    {
        $queryBuilder = $this->createQueryBuilder('redirect')
            ->select('COUNT(redirect.id)')
            ->andWhere('redirect.sourceUrl = :sourceUrl')
            ->setParameter('sourceUrl', $sourceUrl)
        ;

        if ($excludeId) {
            $queryBuilder
                ->andWhere('redirect.id != :excludeId')
                ->setParameter('excludeId', $excludeId)
            ;
        }

        return (int) $queryBuilder->getQuery()->getSingleScalarResult() > 0;
    }
}
