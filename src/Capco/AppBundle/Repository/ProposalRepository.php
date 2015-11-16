<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\CollectStep;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\District;
use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * ProposalRepository.
 */
class ProposalRepository extends EntityRepository
{
    public function getByUser(User $user)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('district', 'status', 'form', 'step')
            ->leftJoin('proposal.district', 'district')
            ->leftJoin('proposal.status', 'status')
            ->leftJoin('proposal.proposalForm', 'form')
            ->leftJoin('form.step', 'step')
            ->andWhere('proposal.author = :author')
            ->setParameter('author', $user)
        ;

        return $qb->getQuery()->getResult();
    }

    public function getEnabledByProposalForm(ProposalForm $proposalForm, $first = 0, $offset = 100, $order = 'last', Theme $theme = null, Status $status = null, District $district = null, UserType $type = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->join('proposal.author', 'author')
            ->andWhere('proposal.isTrashed = :notTrashed')
            ->andWhere('proposal.proposalForm = :proposalForm')
            ->setParameter('notTrashed', false)
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
            $qb->addOrderBy('proposal.createdAt', 'ASC');
        }

        if ($order === 'last') {
            $qb->addOrderBy('proposal.createdAt', 'DESC');
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
            ->andWhere('proposal.isTrashed = :notTrashed')
            ->andWhere('proposal.proposalForm = :proposalForm')
            ->setParameter('notTrashed', false)
            ->setParameter('proposalForm', $form)
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
     *
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOne($slug)
    {
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
            ->orderBy('proposal.commentsCount', 'DESC')
            ->addOrderBy('proposal.createdAt', 'DESC')
            ->addGroupBy('proposal.id');

        $qb->setMaxResults($limit);
        $qb->setFirstResult($offset);

        return $qb
            ->getQuery()
            ->execute()
        ;
    }

    /**
     * Get last proposals.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return mixed
     */
    public function getLastByStep($limit = 1, $offset = 0, CollectStep $step)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('proposal')
            ->leftJoin('proposal.author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('proposal.theme', 't')
            ->leftJoin('proposal.proposalForm', 'f')
            ->andWhere('f.step = :step')
            ->andWhere('proposal.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->setParameter('step', $step)
            ->orderBy('proposal.commentsCount', 'DESC')
            ->addOrderBy('proposal.createdAt', 'DESC')
            ->addGroupBy('proposal.id');

        $qb->setMaxResults($limit);
        $qb->setFirstResult($offset);

        return $qb
            ->getQuery()
            ->execute()
        ;
    }

    /**
     * Get all trashed or unpublished proposals.
     *
     * @param $project
     *
     * @return array
     */
    public function getTrashedOrUnpublishedByProject($project)
    {
        $qb = $this->createQueryBuilder('p')
            ->addSelect('f', 's', 'aut', 'm')
            ->leftJoin('p.author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('p.proposalForm', 'f')
            ->leftJoin('f.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->andWhere('pas.project = :project')
            ->andWhere('p.isTrashed = :trashed OR p.enabled = :disabled')
            ->setParameter('project', $project)
            ->setParameter('trashed', true)
            ->setParameter('disabled', false)
            ->orderBy('p.trashedAt', 'DESC');

        return $qb->getQuery()->getResult();
    }
}
