<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class SiteParameterRepository extends EntityRepository
{
    public function getValuesIfEnabled(): array
    {
        return $this->getEntityManager()
            ->createQueryBuilder()
            ->from($this->getClassName(), 'p', 'p.keyname')
            ->select('p.value', 'p.keyname', 'p.type')
            ->andWhere('p.isEnabled = 1')
            ->groupBy('p.keyname')
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 60)
            ->getResult();
    }
}
