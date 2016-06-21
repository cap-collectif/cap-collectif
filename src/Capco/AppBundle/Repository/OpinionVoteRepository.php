<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Doctrine\ORM\EntityRepository;

/**
 * OpinionVoteRepository.
 */
class OpinionVoteRepository extends EntityRepository
{
    /**
     * Get enabled by consultation step.
     *
     * @param $step
     *
     * @return mixed
     */
    public function getEnabledByConsultationStep(ConsultationStep $step)
    {
        $qb = $this->getIsConfirmedQueryBuilder()
            ->addSelect('u', 'ut', 'o')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->leftJoin('v.opinion', 'o')
            ->andWhere('o.step = :step')
            ->andWhere('o.isEnabled = 1')
            ->setParameter('step', $step)
            ->orderBy('v.updatedAt', 'ASC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Get all by opinion.
     *
     * @param $opinion
     *
     * @return mixed
     */
    public function getAllByOpinion($opinionId, $asArray = false)
    {
        $qb = $this->getIsConfirmedQueryBuilder()
            ->addSelect('u', 'ut', 'o')
            ->leftJoin('v.user', 'u')
            ->leftJoin('u.userType', 'ut')
            ->leftJoin('v.opinion', 'o')
            ->andWhere('v.opinion = :opinion')
            ->setParameter('opinion', $opinionId)
            ->orderBy('v.updatedAt', 'ASC');

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    protected function getIsConfirmedQueryBuilder()
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.confirmed = :confirmed')
            ->setParameter('confirmed', true);
    }
}
