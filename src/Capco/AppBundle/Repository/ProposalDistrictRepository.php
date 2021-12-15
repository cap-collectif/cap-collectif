<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\District\DistrictTranslation;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;

class ProposalDistrictRepository extends EntityRepository
{
    public function getDistrictsWithProposalsCountForStep(CollectStep $step, $limit = null)
    {
        $qb = $this->createQueryBuilder('d')
            ->addSelect(
                '(
                SELECT COUNT(p.id) as pCount
                FROM CapcoAppBundle:Proposal p
                LEFT JOIN p.proposalForm pf
                LEFT JOIN p.district pd
                WHERE pf.step = :step
                AND p.published = true
                AND pd.id = d.id
                AND p.trashedStatus IS NULL
                AND p.draft = false
            ) as value'
            )
            ->setParameter('step', $step)
            ->orderBy('value', 'DESC');
        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getArrayResult();
    }

    public function countAll(): int
    {
        $qb = $this->createQueryBuilder('d')->select('COUNT(d.id)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findDistrictByName(string $name, ProposalForm $form): ?ProposalDistrict
    {
        $builder = $this->createQueryBuilder('pd')
            ->join(DistrictTranslation::class, 'dt', Join::WITH, 'dt.translatable = pd')
            ->where('dt.name = :name')
            ->andWhere('pd.form = :form')
            ->setParameter('name', $name)
            ->setParameter('form', $form)
            ->orderBy('dt.name');

        return $builder->getQuery()->getOneOrNullResult();
    }
}
