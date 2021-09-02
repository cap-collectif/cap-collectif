<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Doctrine\ORM\EntityRepository;

/**
 * @method ExternalServiceConfiguration|null find($id, $lockMode = null, $lockVersion = null)
 * @method ExternalServiceConfiguration|null findOneBy(array $criteria, array $orderBy = null)
 * @method ExternalServiceConfiguration[]    findAll()
 * @method ExternalServiceConfiguration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ExternalServiceConfigurationRepository extends EntityRepository
{
}
