<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * SiteParameterRepository.
 */
class SiteParameterRepository extends EntityRepository
{
    public function getValuesIfEnabled(): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->from($this->getClassName(), 'p', 'p.keyname')
            ->select('p.value', 'p.keyname', 'p.type')
            ->groupBy('p.keyname')
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 60)
            ->getResult();
    }
}
