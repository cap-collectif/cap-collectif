<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * SiteParameterRepository
 */
class SiteParameterRepository extends EntityRepository
{
    public function getValueByKeyIfEnabled($key)
    {
        return $this->createQueryBuilder('p')
            ->select('p.value')
            ->andWhere('p.keyname = :key')
            ->andWhere('p.isEnabled = :enabled')
            ->setParameter('key', $key)
            ->setParameter('enabled', true)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
