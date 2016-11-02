<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Doctrine\ORM\EntityRepository;

class CategoryRepository extends EntityRepository
{
    public function getCategoriesWithProposalsCountForStep(CollectStep $step, $limit = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('c.title as name')
            ->addSelect('(
                SELECT COUNT(p.id) as pCount
                FROM CapcoAppBundle:Proposal p
                LEFT JOIN p.proposalForm pf
                LEFT JOIN p.category pc
                WHERE pf.step = :step
                AND p.enabled = true
                AND pc.id = c.id
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
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(c.id)')
        ;

        return intval($qb->getQuery()->getSingleScalarResult());
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.isEnabled = :enabled')
            ->setParameter('enabled', true);
    }
}
