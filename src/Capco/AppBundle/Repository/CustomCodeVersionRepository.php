<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\CustomCodeVersion;
use Doctrine\ORM\EntityRepository;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @method null|CustomCodeVersion find($id, $lockMode = null, $lockVersion = null)
 */
class CustomCodeVersionRepository extends EntityRepository
{
    /**
     * @return CustomCodeVersion[]
     */
    public function findLatestByKeyname(string $keyname, int $limit = 20): array
    {
        return $this->createQueryBuilder('version')
            ->andWhere('version.keyname = :keyname')
            ->setParameter('keyname', $keyname)
            ->orderBy('version.createdAt', 'DESC')
            ->addOrderBy('version.id', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function findLatestMetadataByKeyname(string $keyname, int $limit = 20, int $offset = 0): array
    {
        $versions = $this->createQueryBuilder('version')
            ->select(
                'version.id',
                'version.keyname',
                'version.title',
                'version.authorName',
                'version.description',
                'version.referenceUrl',
                'version.contentHash',
                'version.previousContentHash',
                'version.type',
                'version.createdByUserId',
                'version.createdAt'
            )
            ->andWhere('version.keyname = :keyname')
            ->setParameter('keyname', $keyname)
            ->orderBy('version.createdAt', 'DESC')
            ->addOrderBy('version.id', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getArrayResult()
        ;

        return array_map(static function (array $version): array {
            $version['id'] = GlobalId::toGlobalId('CustomCodeVersion', $version['id']);
            $version['content'] = null;
            $version['restoredFromVersion'] = null;

            return $version;
        }, $versions);
    }

    public function countByKeyname(string $keyname): int
    {
        return (int) $this->createQueryBuilder('version')
            ->select('COUNT(version.id)')
            ->andWhere('version.keyname = :keyname')
            ->setParameter('keyname', $keyname)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }
}
