<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SSO\AbstractSSOConfiguration;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\ResultSetMapping;
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

    public function getPublicList(): array
    {
        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('name', 'name');
        $rsm->addScalarResult('ssoType', 'ssoType');
        $rsm->addScalarResult('button_color', 'buttonColor');
        $rsm->addScalarResult('label_color', 'labelColor');
        $query = $this->getEntityManager()->createNativeQuery(
            '
            SELECT name, ssoType, button_color, label_color
            FROM sso_configuration
            WHERE enabled = 1
        ',
            $rsm
        );

        return $query->getResult(AbstractQuery::HYDRATE_ARRAY);
    }
}
