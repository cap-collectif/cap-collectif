<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * SiteImageRepository.
 */
class SiteImageRepository extends EntityRepository
{
    public function getValuesIfEnabled()
    {
        return $this->_em->createQueryBuilder()
            ->select('p', 'm')
            ->from($this->getClassName(), 'p', 'p.keyname')
            ->leftJoin('p.Media', 'm')
            ->andWhere('p.isEnabled = :enabled')
            ->setParameter('enabled', true)
            ->groupBy('p.keyname')
            ->getQuery()
            ->getResult();
    }
}
