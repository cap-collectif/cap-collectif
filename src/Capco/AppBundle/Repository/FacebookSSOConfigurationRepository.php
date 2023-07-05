<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SSO\FacebookSSOConfiguration;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|FacebookSSOConfiguration find($id, $lockMode = null, $lockVersion = null)
 * @method null|FacebookSSOConfiguration findOneBy(array $criteria, array $orderBy = null)
 * @method FacebookSSOConfiguration[]    findAll()
 * @method FacebookSSOConfiguration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class FacebookSSOConfigurationRepository extends EntityRepository
{
    //one and only one configuration is expected
    public function get(): ?FacebookSSOConfiguration
    {
        return $this->findOneBy([]);
    }
}
