<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

/**
 * ConsultationTypeRepository.
 */
class ConsultationTypeRepository extends EntityRepository
{
    /**
     * Get opinion types by id of consultation type.
     *
     * @param $id
     *
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getRelatedTypes($id)
    {
        $qb = $this->getIsEnabledQueryBuilder('ct')
            ->select('ot.id')
            ->leftJoin('ct.opinionTypes', 'ot')
            ->andWhere('ct.id = :id')
            ->setParameter('id', $id)
        ;

        return array_map('current',
            $qb
            ->getQuery()
            ->getScalarResult());
    }

    /**
     * @return QueryBuilder
     */
    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('ct')
            ->andWhere('ct.enabled = :enabled')
            ->setParameter('enabled', true);
    }
}
