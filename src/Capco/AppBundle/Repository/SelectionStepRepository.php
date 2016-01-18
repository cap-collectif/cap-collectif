<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Steps\SelectionStep;

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

        $qb = $this->createQueryBuilder('ss');
        $expr = $qb->expr();
        $qb->leftJoin('ss.projectAbstractStep', 'pas')
            ->where('ss.id in (:ids)')
            ->andWhere($expr->neq('ss.voteType', SelectionStep::VOTE_TYPE_DISABLED))
            ->setParameter('ids', $ids)
            ->orderBy('pas.position')
        ;

        return $qb->getQuery()->getResult();
    }
}
