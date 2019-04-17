<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

/**
 * ConsultationRepository.
 */
class ConsultationRepository extends EntityRepository
{
    /**
     * Get opinion types by id of consultation step type.
     *
     * @param $id
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return mixed
     */
    public function getRelatedTypes($id)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('ot.id')
            ->leftJoin('c.opinionTypes', 'ot')
            ->andWhere('c.id = :id')
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
        return $this->createQueryBuilder('c')
            ->andWhere('c.enabled = :enabled')
            ->setParameter('enabled', true);
    }
}
