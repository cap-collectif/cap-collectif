<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * SiteImageRepository
 */
class SiteImageRepository extends EntityRepository
{

    public function getMediaByKeyIfEnabled($key)
    {
        $result = $this->createQueryBuilder('p')
        	->addSelect('m')
        	->leftJoin('p.Media', 'm')
            ->andWhere('p.keyname = :key')
            ->andWhere('p.isEnabled = :enabled')
            ->setParameter('key', $key)
            ->setParameter('enabled', true)
            ->getQuery()
            ->getOneOrNullResult();

        if(null != $result){
            return $result->getMedia();
        }
        else
            return $result;
    }

}
