<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * SiteParameterRepository.
 */
class SiteParameterRepository extends EntityRepository
{
    public function getValuesIfEnabled()
    {
        return $this->_em->createQueryBuilder()
            ->from($this->getClassName(), 'p', 'p.keyname')
            ->select('p.value', 'p.keyname', 'p.type')
            ->andWhere('p.isEnabled = :enabled')
            ->setParameter('enabled', true)
            ->groupBy('p.keyname')
            ->getQuery()
            ->getResult();
    }
}
