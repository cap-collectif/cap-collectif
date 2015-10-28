<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ProposalForm;
use Doctrine\ORM\EntityRepository;

/**
 * ProposalRepository.
 */
class ProposalRepository extends EntityRepository
{
    public function getByProposalForm(ProposalForm $proposalForm)
    {
        return $this->getIsEnabledQueryBuilder()
            ->andWhere('proposal.proposalForm = :proposalForm')
            ->setParameter('proposalForm', $proposalForm);
    }

    /**
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getIsEnabledQueryBuilder($alias = 'proposal')
    {
        return $this->createQueryBuilder($alias)
            ->andWhere($alias.'.enabled = :enabled')
            ->setParameter('enabled', true);
    }

    /**
     * @param $slug
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOne($slug) {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('pr')
            ->leftJoin('proposal.proposalResponses', 'pr')
            ->andWhere('proposal.slug = :slug')
            ->setParameter('slug', $slug)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }
}
