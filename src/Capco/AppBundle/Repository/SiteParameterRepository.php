<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\ORM\EntityRepository;

/**
 * @method SiteParameter|null findOneBy(array $criteria, array $orderBy = null)
 */
class SiteParameterRepository extends EntityRepository
{
    public const REGISTRATION_PAGE_CODE_KEYNAME = 'registration.customcode';

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
