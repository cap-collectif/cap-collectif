<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;


/**
 * SiteParameterRepository.
 */
class SiteColorRepository extends EntityRepository
{
    public function getValuesIfEnabled()
    {
        return $this->createQueryBuilder('p')
            ->select('p.keyname, p.value')
            ->andWhere('p.isEnabled = :enabled')
            ->setParameter('enabled', true)
            ->getQuery()
            ->getResult();
    }
}
