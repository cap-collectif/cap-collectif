<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|FranceConnectSSOConfiguration find($id, $lockMode = null, $lockVersion = null)
 * @method null|FranceConnectSSOConfiguration findOneBy(array $criteria, array $orderBy = null)
 * @method FranceConnectSSOConfiguration[]    findAll()
 * @method FranceConnectSSOConfiguration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class FranceConnectSSOConfigurationRepository extends EntityRepository
{
}
