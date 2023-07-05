<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SiteSettings;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|SiteSettings find($id, $lockMode = null, $lockVersion = null)
 * @method null|SiteSettings findOneBy(array $criteria, array $orderBy = null)
 * @method SiteSettings[]    findAll()
 * @method SiteSettings[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SiteSettingsRepository extends EntityRepository
{
    public function findSiteSetting(): ?SiteSettings
    {
        return $this->findAll()[0] ?? null;
    }
}
