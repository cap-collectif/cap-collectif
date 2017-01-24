<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Doctrine\ORM\EntityRepository;

class ProposalCategoryRepository extends EntityRepository
{
    public function getCategoriesWithProposalsCountForStep(CollectStep $step, $limit = null)
    {
        $qb = $this->createQueryBuilder('c')
            ->select('c.name as name')
            ->addSelect('(
                SELECT COUNT(p.id) as pCount
                FROM CapcoAppBundle:Proposal p
                LEFT JOIN p.proposalForm pf
                LEFT JOIN p.category pc
                WHERE pf.step = :step
                AND pc.id = c.id
            ) as value')
            ->andWhere('c.form = :form')
            ->setParameter('step', $step)
            ->setParameter('form', $step->getProposalForm())
            ->orderBy('value', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getArrayResult();
    }

    public function countAll()
    {
        $qb = $this->createQueryBuilder('c')->select('COUNT(c.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
