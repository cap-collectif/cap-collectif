<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Media;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @method null|Media find($id, $lockMode = null, $lockVersion = null)
 * @method null|Media findOneBy(array $criteria, array $orderBy = null)
 * @method Media[]    findAll()
 * @method Media[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 * @extends EntityRepository<Media>
 */
class MediaRepository extends EntityRepository
{
    /**
     * @return array<Media> list of Media entities that belong to default categories
     */
    public function getAllDefaultCategoryImages(): array
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
            ->setParameter('names', $mediaName)
        ;

        // @var array<Media>
        return $qb->getQuery()->getResult();
    }

    /**
     * @return Paginator<Media>
     */
    public function getWithoutCategoryPaginated(
        int $offset = 0,
        int $limit = 10,
        ?string $term = null
    ): Paginator {
        $qb = $this->getQueryBuilderWithoutCategory($term)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;

        return new Paginator($qb);
    }

    /**
     * @return array<Media>
     */
    public function getWithoutCategory(): array
    {
        // @var array<Media>
        return $this->getQueryBuilderWithoutCategory()->getQuery()->getResult();
    }

    public function countAllWithoutCategory(?string $term = null): int
    {
        $qb = $this->getQueryBuilderWithoutCategory($term)->select('COUNT(m.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    private function getQueryBuilderWithoutCategory(?string $term = null): QueryBuilder
    {
        $qb = $this->createQueryBuilder('m')
            ->leftJoin('CapcoAppBundle:CategoryImage', 'ci', 'WITH', 'm.id = ci.image')
            ->andWhere('ci.image IS NULL')
            ->orderBy('m.createdAt', 'DESC')
        ;

        if ($term) {
            $qb->andWhere('m.name LIKE :term')->setParameter('term', '%' . $term . '%');
        }

        return $qb;
    }
}
