<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Doctrine\ORM\EntityRepository;

/**
 * SourceVoteRepository.
 */
class SourceVoteRepository extends EntityRepository
{
    /**
     * Get enabled by consultation step.
     *
     * @param $step
     * @param $asArray
     *
     * @return mixed
     */
    public function getEnabledByConsultationStep(ConsultationStep $step, $asArray = false)
    {
        $qb = $this->getQueryBuilder()
            ->addSelect('u', 'ut')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->leftJoin('v.source', 'source')
            ->leftJoin('source.Opinion', 'o')
            ->leftJoin('source.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere('
                (source.Opinion IS NOT NULL AND o.step = :step AND o.isEnabled = 1)
                OR
                (source.opinionVersion IS NOT NULL AND ovo.step = :step AND ov.enabled = 1 AND ovo.isEnabled = 1)'
            )
            ->setParameter('step', $step)
        ;

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    /**
     * Get all by source.
     *
     * @param $sourceId
     * @param mixed $asArray
     *
     * @return mixed
     */
    public function getAllBySource($sourceId, $asArray = false)
    {
        $qb = $this->getQueryBuilder()
            ->addSelect('u', 'ut')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->andWhere('v.source = :source')
            ->setParameter('source', $sourceId)
            ->orderBy('v.updatedAt', 'ASC')
        ;

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    protected function getQueryBuilder()
    {
        return $this->createQueryBuilder('v')
                    ->andWhere('v.expired = false')
        ;
    }
}
