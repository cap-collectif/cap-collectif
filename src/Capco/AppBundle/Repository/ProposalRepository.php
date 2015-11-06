<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\District;
use Capco\UserBundle\Entity\UserType;
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

    public function getEnabledByProposalForm(ProposalForm $proposalForm, $first = 0, $offset = 100, $order = 'last', Theme $theme = null, Status $status = null, District $district = null, UserType $type = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->join('proposal.author', 'author')
            ->andWhere('proposal.proposalForm = :proposalForm')
            ->setParameter('proposalForm', $proposalForm)
        ;

        if ($theme) {
            $qb->andWhere('proposal.theme = :theme')
               ->setParameter('theme', $theme);
        }

        if ($status) {
            $qb->andWhere('proposal.status = :status')
               ->setParameter('status', $status);
        }

        if ($district) {
            $qb->andWhere('proposal.district = :district')
               ->setParameter('district', $district);
        }

        if ($type) {
            $qb->andWhere('author.userType = :type')
               ->setParameter('type', $type);
        }

        if ($order === 'old') {
            $qb->addOrderBy('proposal.updatedAt', 'ASC');
        }

        if ($order === 'last') {
            $qb->addOrderBy('proposal.updatedAt', 'DESC');
        }

        if ($order === 'popular') {
            $qb->addOrderBy('proposal.votesCount', 'DESC');
        }

        if ($order === 'comments') {
            $qb->addOrderBy('proposal.commentsCount', 'DESC');
        }

        $qb
            ->setFirstResult($first)
            ->setMaxResults($offset)
        ;

        return new Paginator($qb);
    }
    
    public function countEnabledForForm($form)
    {
        $qb = $this
            ->getIsEnabledQueryBuilder()
            ->select('COUNT(proposal.id) as proposalsCount')
            ->andWhere('proposal.proposalForm = :form')
            ->setParameter('form', $form)
        ;
        return $qb->getQuery()->getSingleScalarResult();
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

        $qb->setMaxResults($limit);
        $qb->setFirstResult($offset);

        return $qb
            ->getQuery()
            ->execute();
    }
}
