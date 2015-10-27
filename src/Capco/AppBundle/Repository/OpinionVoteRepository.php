<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ConsultationStep;
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
            ->addSelect('u', 'o')
            ->leftJoin('v.user', 'u')
            ->leftJoin('v.opinion', 'o')
            ->andWhere('o.step = :step')
            ->setParameter('step', $step)
            ->orderBy('v.updatedAt', 'ASC');

        return $qb
            ->getQuery()
            ->execute();
    }

    protected function getIsConfirmedQueryBuilder()
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.confirmed = :confirmed')
            ->setParameter('confirmed', true);
    }
}
