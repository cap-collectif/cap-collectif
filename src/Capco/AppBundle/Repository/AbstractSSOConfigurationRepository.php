<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SSO\AbstractSSOConfiguration;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\ResultSetMapping;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @method null|AbstractSSOConfiguration find($id, $lockMode = null, $lockVersion = null)
 * @method null|AbstractSSOConfiguration findOneBy(array $criteria, array $orderBy = null)
 * @method AbstractSSOConfiguration[]    findAll()
 * @method AbstractSSOConfiguration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null) */
class AbstractSSOConfigurationRepository extends EntityRepository
{
    public function getPaginated(int $limit, int $offset): Paginator
    {
        $qb = $this->createQueryBuilder('sso')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;

        return new Paginator($qb);
    }

    public function findSsoByType(int $limit, int $offset, string $type): Paginator
    {
        $qb = $this->createQueryBuilder('sso')
            ->andWhere('sso INSTANCE OF :type')
            ->setParameter('type', $type)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
        ;

        return new Paginator($qb);
    }

    public function findASsoByType(string $type): ?AbstractSSOConfiguration
    {
        $qb = $this->createQueryBuilder('sso')
            ->andWhere('sso INSTANCE OF :type')
            ->setParameter('type', $type)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getPublicList(): array
    {
        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('name', 'name');
        $rsm->addScalarResult('ssoType', 'ssoType');
        $query = $this->getEntityManager()->createNativeQuery(
            '
            SELECT name, ssoType
            FROM sso_configuration
            WHERE enabled = 1
        ',
            $rsm
        );

        return $query->getResult(AbstractQuery::HYDRATE_ARRAY);
    }

    public function findOneByType(string $type, ?bool $isEnabled = null): ?AbstractSSOConfiguration
    {
        $qb = $this->createQueryBuilder('sso')
            ->andWhere('sso INSTANCE OF :type')
            ->setParameters(['type' => $type])
        ;

        if (true === $isEnabled || false === $isEnabled) {
            $qb->andWhere('sso.enabled = :enabled')
                ->setParameter('enabled', $isEnabled)
            ;
        }

        return $qb
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
}
