<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Doctrine\ORM\EntityRepository;

/**
 * @method CASSSOConfiguration|null find($id, $lockMode = null, $lockVersion = null)
 * @method CASSSOConfiguration|null findOneBy(array $criteria, array $orderBy = null)
 * @method CASSSOConfiguration[]    findAll()
 * @method CASSSOConfiguration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class CASSSOConfigurationRepository extends EntityRepository
{
    //one and only one configuration is expected
    public function get(): ?CASSSOConfiguration
    {
        return $this->findOneBy([]);
    }
}
