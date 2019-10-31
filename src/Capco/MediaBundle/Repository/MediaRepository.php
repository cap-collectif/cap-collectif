<?php

namespace Capco\MediaBundle\Repository;

use Doctrine\ORM\EntityRepository;

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
            'media-scolarite'
        ];
        $qb = $this->createQueryBuilder('m')
            ->andWhere('m.name IN (:names)')->setParameter('names', $mediaName);

        return $qb->getQuery()->getResult();
    }
}
