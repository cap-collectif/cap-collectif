<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|Oauth2SSOConfiguration find($id, $lockMode = null, $lockVersion = null)
 * @method null|Oauth2SSOConfiguration findOneBy(array $criteria, array $orderBy = null)
 * @method Oauth2SSOConfiguration[]    findAll()
 * @method Oauth2SSOConfiguration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class Oauth2SSOConfigurationRepository extends EntityRepository
{
}
