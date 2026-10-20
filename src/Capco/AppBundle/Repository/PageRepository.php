<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Page;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class PageRepository extends EntityRepository implements SluggableRepositoryInterface
{
    public function getAll()
    {
        $qb = $this->createQueryBuilder('p')->orderBy('p.createdAt', 'ASC');

        return $qb->getQuery()->getResult();
    }

    public function getBySlug(string $slug): ?Page
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.translations', 'pt')
            ->andWhere('pt.slug = :slug')
            ->setParameter('slug', $slug)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * Pages are ordered by their title in the default locale, like the former Sonata list.
     */
    public function getPaginated(
        string $defaultLocale,
        ?string $search = null,
        ?int $offset = null,
        ?int $limit = null
    ): Paginator {
        $qb = $this->getPaginatedQueryBuilder($search)
            ->leftJoin('p.translations', 'dt', 'WITH', 'dt.locale = :defaultLocale')
            ->setParameter('defaultLocale', $defaultLocale)
            ->orderBy('dt.title', 'ASC')
            ->addOrderBy('p.id', 'ASC')
        ;

        if (null !== $offset) {
            $qb->setFirstResult($offset);
        }

        if (null !== $limit) {
            $qb->setMaxResults($limit);
        }

        return new Paginator($qb);
    }

    public function countAll(?string $search = null): int
    {
        $qb = $this->getPaginatedQueryBuilder($search)->select('COUNT(DISTINCT p.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    private function getPaginatedQueryBuilder(?string $search = null): QueryBuilder
    {
        $qb = $this->createQueryBuilder('p');

        if (null !== $search && '' !== trim($search)) {
            $qb
                ->leftJoin('p.translations', 'st')
                ->andWhere('st.title LIKE :search')
                ->setParameter('search', '%' . trim($search) . '%')
            ;
        }

        return $qb;
    }
}
