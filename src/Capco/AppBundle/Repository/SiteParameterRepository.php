<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * SiteParameterRepository
 */
class SiteParameterRepository extends EntityRepository
{
    public function getValueByKey($key)
    {
        return $this->createQueryBuilder('p')
            ->select('p.value')
            ->andWhere('p.keyname = :key')
            ->setParameter('key', $key)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
