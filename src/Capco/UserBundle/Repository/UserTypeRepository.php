<?php

namespace Capco\UserBundle\Repository;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Doctrine\ORM\EntityRepository;
use Capco\UserBundle\Entity\UserType;

/**
 * UserTypeRepository.
 */
class UserTypeRepository extends EntityRepository
{
    public function getUserTypesWithProposalsCountForStep(CollectStep $step, $limit = null)
    {
        $qb = $this->createQueryBuilder('ut')
            ->select('ut.name as name')
            ->addSelect('(
                SELECT COUNT(p.id) as pCount
                FROM CapcoAppBundle:Proposal p
                LEFT JOIN p.proposalForm pf
                LEFT JOIN p.author pa
                LEFT JOIN pa.userType paut
                WHERE pf.step = :step
                AND p.enabled = true
                AND paut.id = ut.id
            ) as value')
            ->setParameter('step', $step)
            ->orderBy('value', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getArrayResult();
    }

    public function countAll()
    {
        $qb = $this->createQueryBuilder('ut')
            ->select('COUNT(ut.id)')
        ;

        return intval($qb->getQuery()->getSingleScalarResult());
    }
}
