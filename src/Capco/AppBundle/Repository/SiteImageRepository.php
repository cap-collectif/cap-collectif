<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SiteImage;
use Doctrine\ORM\EntityRepository;

/**
 * SiteImageRepository.
 */
class SiteImageRepository extends EntityRepository
{
    public function getSiteFavicon(): ?SiteImage
    {
        $qb = $this->createQueryBuilder('si');

        return $qb
            ->andWhere($qb->expr()->eq('si.keyname', ':keyname'))
            ->setParameter('keyname', 'favicon')
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function getAppLogo(): ?SiteImage
    {
        $qb = $this->createQueryBuilder('si');

        return $qb
            ->andWhere($qb->expr()->eq('si.keyname', ':keyname'))
            ->setParameter('keyname', 'image.logo')
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function getValuesIfEnabled()
    {
        return $this->getEntityManager()
            ->createQueryBuilder()
            ->select('p', 'm')
            ->from($this->getClassName(), 'p', 'p.keyname')
            ->leftJoin('p.media', 'm')
            ->andWhere('p.isEnabled = 1')
            ->groupBy('p.keyname')
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 60)
            ->getResult();
    }
}
