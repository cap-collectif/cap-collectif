<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Doctrine\ORM\EntityRepository;

class ProposalCategoryRepository extends EntityRepository
{
    public function hydrateFromIdsOrdered(array $ids): array
    {
        $qb = $this->createQueryBuilder('pc');
        $qb->addOrderBy('FIELD(pc.id, :ids)')
            ->where('pc.id IN (:ids)')
            ->setParameter('ids', $ids)
        ;

        return $qb->getQuery()->getResult();
    }

    public function getCategoriesWithProposalsCountForStep(CollectStep $step, $limit = null)
    {
        $qb = $this->createQueryBuilder('c')
            ->select('c.name as name')
            ->addSelect('c.id as id')
            ->addSelect(
                '(
                SELECT COUNT(p.id) as pCount
                FROM CapcoAppBundle:Proposal p
                LEFT JOIN p.proposalForm pf
                LEFT JOIN p.category pc
                WHERE pf.step = :step
                AND pc.id = c.id
                AND p.trashedAt IS NULL
                AND p.draft = false
            ) as value'
            )
            ->setParameter('step', $step)
            ->orderBy('value', 'DESC')
        ;
        if ($step->getProposalForm()) {
            $qb->andWhere('c.form = :form')->setParameter('form', $step->getProposalForm());
        }

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getArrayResult();
    }

    public function countAll(): int
    {
        $qb = $this->createQueryBuilder('c')->select('COUNT(c.id)');

        return $qb->getQuery()->getSingleScalarResult();
    }
}
