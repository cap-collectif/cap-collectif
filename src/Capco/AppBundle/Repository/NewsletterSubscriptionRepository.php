<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

/**
 * @extends EntityRepository<NewsletterSubscription>
 */
class NewsletterSubscriptionRepository extends EntityRepository
{
    /**
     * @return NewsletterSubscription[]
     */
    public function getPaginated(?string $search = null, ?int $offset = null, ?int $limit = null): array
    {
        $qb = $this->getSearchQueryBuilder($search)
            ->orderBy('ns.email', 'ASC')
            ->addOrderBy('ns.id', 'ASC')
        ;

        if (null !== $offset) {
            $qb->setFirstResult($offset);
        }

        if (null !== $limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getResult();
    }

    public function countAll(?string $search = null): int
    {
        return (int) $this->getSearchQueryBuilder($search)
            ->select('COUNT(ns.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * @return iterable<NewsletterSubscription>
     */
    public function iterateAllOrderedByEmail(): iterable
    {
        return $this->createQueryBuilder('ns')
            ->orderBy('ns.email', 'ASC')
            ->getQuery()
            ->toIterable()
        ;
    }

    private function getSearchQueryBuilder(?string $search): QueryBuilder
    {
        $qb = $this->createQueryBuilder('ns');

        if (null !== $search && '' !== trim($search)) {
            $qb->andWhere('ns.email LIKE :search')->setParameter('search', '%' . addcslashes(trim($search), '%_') . '%');
        }

        return $qb;
    }
}
