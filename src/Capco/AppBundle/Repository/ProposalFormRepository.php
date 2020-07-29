<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class ProposalFormRepository extends EntityRepository
{
    /**
     * @param $id
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return mixed
     */
    public function getOne($id)
    {
        $qb = $this->createQueryBuilder('pf')
            ->addSelect('pf', 'p', 'q')
            ->leftJoin('pf.proposals', 'p')
            ->leftJoin('pf.questions', 'q')
            ->andWhere('pf.id = :id')
            ->setParameter('id', $id);

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function searchByTerm(string $term): array
    {
        $qb = $this->createQueryBuilder('f');
        $qb->andWhere(
            $qb
                ->expr()
                ->andX(
                    $qb->expr()->like('f.title', $qb->expr()->literal('%' . $term . '%')),
                    $qb->expr()->isNull('f.step')
                )
        );

        return $qb->getQuery()->getResult();
    }

    public function getLastProposalReference(string $formId): int
    {
        $qb = $this->createQueryBuilder('f')
            ->select('MAX(p.reference) AS last_reference')
            ->leftJoin('f.proposals', 'p')
            ->where('f.id = :form_id')
            ->setParameter('form_id', $formId);

        return $qb->getQuery()->getSingleScalarResult() ?? 0;
    }
}
