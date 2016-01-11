<?php

namespace Capco\AppBundle\Repository;

/**
 * SelectionStepRepository.
 */
class SelectionStepRepository extends AbstractStepRepository
{
    public function getVotableStepsForProposal($proposal)
    {
        $ids = array_map(function ($value) {
            return $value->getId();
        }, $proposal->getSelectionSteps()->getValues());

        $qb = $this->createQueryBuilder('ss')
            ->leftJoin('ss.projectAbstractStep', 'pas')
            ->where('ss.id in (:ids)')
            ->andWhere('ss.votable = :votable')
            ->setParameter('ids', $ids)
            ->setParameter('votable', 1)
            ->orderBy('pas.position')
        ;

        return $qb->getQuery()->getResult();
    }
}
