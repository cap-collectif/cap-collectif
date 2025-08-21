<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Media;
use Doctrine\DBAL\Exception;
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
     * @throws Exception
     */
    public function deleteUnusedMedia(): int
    {
        $connection = $this->getEntityManager()->getConnection();

        $mediasRelatedFKSql = "
            SELECT TABLE_NAME, COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = 'media__media'
              AND REFERENCED_COLUMN_NAME = 'id'
        ";

        $mediasRelatedFKRows = $connection->fetchAllAssociative($mediasRelatedFKSql);

        $notExistsClauses = [];
        foreach ($mediasRelatedFKRows as $row) {
            $table = $row['TABLE_NAME'];
            $column = $row['COLUMN_NAME'];
            $notExistsClauses[] = sprintf(
                'NOT EXISTS (SELECT 1 FROM %s WHERE %s.%s = m.id)',
                $table,
                $table,
                $column
            );
        }

        $sql = 'DELETE m FROM media__media m';

        if (!empty($notExistsClauses)) {
            $sql .= ' WHERE ' . implode(' AND ', $notExistsClauses);
        }

        // executeStatement returns the number of affected rows
        return (int) $connection->executeStatement($sql);
    }

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
        ?string $term = null,
        ?bool $showProfilePictures = true,
    ): Paginator {
        $qb = $this->getQueryBuilderWithoutCategory($term, $showProfilePictures)
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

    public function countAllWithoutCategory(?string $term = null, ?bool $showProfilePictures = true): int
    {
        $qb = $this->getQueryBuilderWithoutCategory($term, $showProfilePictures)->select('COUNT(m.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    private function getQueryBuilderWithoutCategory(?string $term = null, ?bool $showProfilePictures = true): QueryBuilder
    {
        $qb = $this->createQueryBuilder('m')
            ->leftJoin('CapcoAppBundle:CategoryImage', 'ci', 'WITH', 'm.id = ci.image')
            ->andWhere('ci.image IS NULL')
            ->orderBy('m.createdAt', 'DESC')
        ;

        if ($term) {
            $qb->andWhere('m.name LIKE :term')->setParameter('term', '%' . $term . '%');
        }

        if (!$showProfilePictures) {
            $qb->leftJoin('CapcoUserBundle:User', 'u', 'WITH', 'u.media = m.id');
            $qb->andWhere('u.id IS NULL');
        }

        return $qb;
    }
}
