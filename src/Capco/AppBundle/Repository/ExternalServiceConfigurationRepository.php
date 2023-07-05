<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|ExternalServiceConfiguration find($id, $lockMode = null, $lockVersion = null)
 * @method null|ExternalServiceConfiguration findOneBy(array $criteria, array $orderBy = null)
 * @method ExternalServiceConfiguration[]    findAll()
 * @method ExternalServiceConfiguration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ExternalServiceConfigurationRepository extends EntityRepository
{
    public function findTwilioConfig(): array
    {
        $qb = $this->createQueryBuilder('e')
            ->where("e.type LIKE '%twilio%'")
        ;

        return $qb->getQuery()->getResult();
    }
}
