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

    /**
     * Get last proposals.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return mixed
     */
    public function getLast($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('proposal')
            ->leftJoin('proposal.author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('proposal.theme', 't')
            ->andWhere('proposal.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->addOrderBy('proposal.createdAt', 'DESC')
            ->addGroupBy('proposal.id');

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb
            ->getQuery()
            ->execute();
    }
}
