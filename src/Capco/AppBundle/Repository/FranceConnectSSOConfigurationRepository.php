<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Doctrine\ORM\EntityRepository;

/**
 * @method FranceConnectSSOConfiguration|null find($id, $lockMode = null, $lockVersion = null)
 * @method FranceConnectSSOConfiguration|null findOneBy(array $criteria, array $orderBy = null)
 * @method FranceConnectSSOConfiguration[]    findAll()
 * @method FranceConnectSSOConfiguration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class FranceConnectSSOConfigurationRepository extends EntityRepository
{
}
