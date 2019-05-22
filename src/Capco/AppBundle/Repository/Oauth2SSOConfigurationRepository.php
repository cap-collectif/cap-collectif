<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Doctrine\ORM\EntityRepository;

/**
 * @method Oauth2SSOConfiguration|null find($id, $lockMode = null, $lockVersion = null)
 * @method Oauth2SSOConfiguration|null findOneBy(array $criteria, array $orderBy = null)
 * @method Oauth2SSOConfiguration[]    findAll()
 * @method Oauth2SSOConfiguration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class Oauth2SSOConfigurationRepository extends EntityRepository
{
}
