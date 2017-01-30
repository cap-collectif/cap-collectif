<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Steps\CollectStep;

/**
 * DistrictRepository.
 */
class DistrictRepository extends EntityRepository
{
    public function getDistrictsWithProposalsCountForStep(CollectStep $step, $limit = null)
    {
        $qb = $this->createQueryBuilder('d')
            ->select('d.name as name')
            ->addSelect('(
                SELECT COUNT(p.id) as pCount
                FROM CapcoAppBundle:Proposal p
                LEFT JOIN p.proposalForm pf
                LEFT JOIN p.district pd
                WHERE pf.step = :step
                AND p.enabled = true
                AND pd.id = d.id
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
        $qb = $this->createQueryBuilder('d')
            ->select('COUNT(d.id)')
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
