<?php

namespace Capco\MediaBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

class MediaRepository extends EntityRepository
{
    public function getAllDefaultCategoryImages()
    {
        $mediaName = [
            'media-securite',
            'media-proprete',
            'media-environnement',
            'media-jeunesse',
            'media-sport',
            'media-pmr',
            'media-sante',
            'media-agriculture',
            'media-mobilite',
            'media-attractivite',
            'media-solidarite',
            'media-culture',
            'media-urbanisme',
            'media-qualite-de-vie',
            'media-scolarite',
        ];
        $qb = $this->createQueryBuilder('m')
            ->andWhere('m.name IN (:names)')
            ->setParameter('names', $mediaName);

        return $qb->getQuery()->getResult();
    }

    private function getQueryBuilderWithoutCategory(?string $term = null): QueryBuilder {
        $qb = $this->createQueryBuilder('m')
            ->leftJoin('CapcoAppBundle:CategoryImage', 'ci', 'WITH', 'm.id = ci.image')
            ->andWhere('ci.image IS NULL');

        if ($term) {
            $qb->andWhere('m.name LIKE :term')->setParameter('term', '%' . $term . '%');
        }

        return $qb;
    }

    public function getWithoutCategoryPaginated(
        int $offset = 0,
        int $limit = 10,
        ?string $term = null
    ): Paginator {
        $qb = $this->getQueryBuilderWithoutCategory($term)
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }

    public function countAllWithoutCategory(?string $term = null): int
    {
        $qb = $this->getQueryBuilderWithoutCategory($term)
            ->select('COUNT(m.id)');

        return (int) $qb
            ->getQuery()
            ->getSingleScalarResult();
    }
}
