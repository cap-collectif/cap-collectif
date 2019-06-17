<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SSO\AbstractSSOConfiguration;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @method AbstractSSOConfiguration|null find($id, $lockMode = null, $lockVersion = null)
 * @method AbstractSSOConfiguration|null findOneBy(array $criteria, array $orderBy = null)
 * @method AbstractSSOConfiguration[]    findAll()
 * @method AbstractSSOConfiguration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class AbstractSSOConfigurationRepository extends EntityRepository
{
    public function getPaginated(int $limit, int $offset): Paginator
    {
        $qb = $this->createQueryBuilder('sso')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
    }
}
