<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\SelectionStep;
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
            ->addSelect('district', 'status', 'theme', 'form', 'step')
            ->leftJoin('proposal.district', 'district')
            ->leftJoin('proposal.status', 'status')
            ->leftJoin('proposal.theme', 'theme')
            ->leftJoin('proposal.proposalForm', 'form')
            ->leftJoin('form.step', 'step')
            ->andWhere('proposal.author = :author')
            ->setParameter('author', $user)
        ;

        return $qb->getQuery()->getResult();
    }

    public function getPublishedByProposalForm(ProposalForm $proposalForm, $first = 0, $offset = 100, $order = 'last', Theme $theme = null, Status $status = null, District $district = null, UserType $type = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('author', 'amedia', 'theme', 'status', 'district')
            ->leftJoin('proposal.author', 'author')
            ->leftJoin('author.Media', 'amedia')
            ->leftJoin('proposal.theme', 'theme')
            ->leftJoin('proposal.district', 'district')
            ->leftJoin('proposal.status', 'status')
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

    public function getPublishedBySelectionStep(SelectionStep $step, $first = 0, $offset = 100, $order = 'last', Theme $theme = null, Status $status = null, District $district = null, UserType $type = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('author', 'amedia', 'theme', 'status', 'district')
            ->leftJoin('proposal.author', 'author')
            ->leftJoin('author.Media', 'amedia')
            ->leftJoin('proposal.theme', 'theme')
            ->leftJoin('proposal.district', 'district')
            ->leftJoin('proposal.status', 'status')
            ->leftJoin('proposal.selectionSteps', 'selectionSteps')
            ->andWhere('proposal.isTrashed = :notTrashed')
            ->andWhere('selectionSteps.id = :stepId')
            ->setParameter('notTrashed', false)
            ->setParameter('stepId', $step->getId())
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

    public function countPublishedForForm($form)
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

    public function countPublishedForSelectionStep(SelectionStep $step)
    {
        $qb = $this
            ->getIsEnabledQueryBuilder()
            ->select('COUNT(proposal.id) as proposalsCount')
            ->leftJoin('proposal.selectionSteps', 'selectionSteps')
            ->andWhere('proposal.isTrashed = :notTrashed')
            ->andWhere('selectionSteps.id = :stepId')
            ->setParameter('notTrashed', false)
            ->setParameter('stepId', $step->getId())
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
            ->addSelect('author', 'amedia', 'theme', 'status', 'district', 'responses', 'questions')
            ->leftJoin('proposal.author', 'author')
            ->leftJoin('author.Media', 'amedia')
            ->leftJoin('proposal.theme', 'theme')
            ->leftJoin('proposal.status', 'status')
            ->leftJoin('proposal.district', 'district')
            ->leftJoin('proposal.responses', 'responses')
            ->leftJoin('responses.question', 'questions')
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
            ->addSelect('author', 'amedia', 'theme', 'status', 'district')
            ->leftJoin('proposal.author', 'author')
            ->leftJoin('author.Media', 'amedia')
            ->leftJoin('proposal.theme', 'theme')
            ->leftJoin('proposal.status', 'status')
            ->leftJoin('proposal.district', 'district')
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
            ->addSelect('author', 'amedia', 'theme', 'status', 'district')
            ->leftJoin('proposal.author', 'author')
            ->leftJoin('author.Media', 'amedia')
            ->leftJoin('proposal.theme', 'theme')
            ->leftJoin('proposal.status', 'status')
            ->leftJoin('proposal.district', 'district')
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
            ->addSelect('f', 's', 'aut', 'm', 'theme', 'status', 'district')
            ->leftJoin('p.author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('p.theme', 'theme')
            ->leftJoin('p.status', 'status')
            ->leftJoin('p.district', 'district')
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

    public function getEnabledByProposalForm(ProposalForm $proposalForm)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('author', 'amedia', 'theme', 'status', 'district', 'responses', 'questions')
            ->leftJoin('proposal.author', 'author')
            ->leftJoin('author.Media', 'amedia')
            ->leftJoin('proposal.theme', 'theme')
            ->leftJoin('proposal.district', 'district')
            ->leftJoin('proposal.status', 'status')
            ->leftJoin('proposal.responses', 'responses')
            ->leftJoin('responses.question', 'questions')
            ->andWhere('proposal.proposalForm = :proposalForm')
            ->setParameter('proposalForm', $proposalForm)
        ;

        return $qb->getQuery()->getResult();
    }

    public function getProposalsWithCostsForStep(CollectStep $step, $limit = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('proposal.title as name', 'proposal.estimation as value')
            ->leftJoin('proposal.proposalForm', 'proposalForm')
            ->andWhere('proposalForm.step = :step')
            ->setParameter('step', $step)
            ->orderBy('proposal.estimation', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getArrayResult();
    }

    public function getProposalsWithVotesCountForSelectionStep(SelectionStep $step, $limit = null, $themeId = null, $districtId = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('proposal.title as name')
            ->addSelect('(
                SELECT COUNT(pv.id) as pvCount
                FROM CapcoAppBundle:ProposalVote pv
                LEFT JOIN pv.proposal as pvp
                LEFT JOIN pv.selectionStep ss
                WHERE ss.id = :stepId
                AND pvp.id = proposal.id
            ) as value')
            ->leftJoin('proposal.selectionSteps', 'selectionSteps')
            ->andWhere('selectionSteps.id = :stepId')
            ->setParameter('stepId', $step->getId())
        ;

        if ($themeId) {
            $qb
                ->leftJoin('proposal.theme', 't')
                ->andWhere('t.id = :themeId')
                ->setParameter('themeId', $themeId)
            ;
        }

        if ($districtId) {
            $qb
                ->leftJoin('proposal.district', 'd')
                ->andWhere('d.id = :districtId')
                ->setParameter('districtId', $districtId)
            ;
        }

        $qb->orderBy('value', 'DESC');

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getArrayResult();
    }

    public function getTotalCostForStep(CollectStep $step)
    {
        $qb = $this->getIsEnabledQueryBuilder('p')
            ->select('SUM(p.estimation)')
            ->leftJoin('p.proposalForm', 'pf')
            ->andWhere('pf.step = :step')
            ->setParameter('step', $step)
        ;

        return intval($qb->getQuery()->getSingleScalarResult());
    }

    public function countForSelectionStep(SelectionStep $step, $themeId = null, $districtId = null)
    {
        $qb = $this->getIsEnabledQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->leftJoin('p.selectionSteps', 'ss')
            ->andWhere('ss.id = :stepId')
            ->setParameter('stepId', $step->getId())
        ;

        if ($themeId) {
            $qb
                ->leftJoin('p.theme', 't')
                ->andWhere('t.id = :themeId')
                ->setParameter('themeId', $themeId)
            ;
        }

        if ($districtId) {
            $qb
                ->leftJoin('p.district', 'd')
                ->andWhere('d.id = :districtId')
                ->setParameter('districtId', $districtId)
            ;
        }

        return intval($qb->getQuery()->getSingleScalarResult());
    }
}
