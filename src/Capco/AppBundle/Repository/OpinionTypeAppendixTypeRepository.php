<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * OpinionTypeAppendixTypeRepository.
 */
class OpinionTypeAppendixTypeRepository extends EntityRepository
{
    /**
     * Get appendix types by id of opinion type.
     *
     * @param $id
     *
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getAppendixTypesByOpinionTypes($id)
    {
        $qb = $this->createQueryBuilder('otat')
            ->select('otat.id', 'at.id', 'at.title')
            ->leftJoin('otat.opinionType', 'ot')
            ->leftJoin('otat.appendixType', 'at')
            ->andWhere('ot.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb
            ->getQuery()
            ->getScalarResult();
    }
}
