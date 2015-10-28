<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Entity\Status;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

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

    public function getEnabledByProposalForm(ProposalForm $proposalForm, $offset = 0, $limit = 100, $order = 'last',Theme $theme = null,Status $status = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->andWhere('proposal.proposalForm = :proposalForm')
            ->setParameter('proposalForm', $proposalForm)
        ;

        if ($theme) {
            $qb->andWhere('proposal.theme = :theme')
               ->setParameter('theme', $theme);
        }

        // if ($status) {
        //     $qb->andWhere('proposal.status = :status')
        //        ->setParameter('status', $status);
        // }

        if ($order === 'old') {
            $qb->addOrderBy('proposal.updatedAt', 'ASC');
        }

        if ($order === 'last') {
            $qb->addOrderBy('proposal.updatedAt', 'DESC');
        }

        if ($order === 'popular') {
            $qb->addOrderBy('proposal.voteCount', 'DESC');
        }

        if ($order === 'comments') {
            $qb->addOrderBy('proposal.commentsCount', 'DESC');
        }

        $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
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
