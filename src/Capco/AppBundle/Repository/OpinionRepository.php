<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Opinion;

class OpinionRepository extends EntityRepository
{
    public function getOne($id)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 'ot', 's')
            ->leftJoin('o.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.step', 's')
            ->leftJoin('o.appendicies', 'appendix')
            ->andWhere('o.id = :id')
            ->setParameter('id', $id)
            ->addOrderBy('appendix.position', 'ASC')
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * Get one opinion by slug.
     *
     * @param $opinion
     *
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneBySlug($opinion)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 'ot', 's')
            ->leftJoin('o.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.step', 's')
            ->andWhere('o.slug = :opinion')
            ->setParameter('opinion', $opinion)
        ;

        return $qb->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Get one opinion by slug with user reports.
     *
     * @param $opinion
     * @param $user
     *
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneBySlugJoinUserReports($opinion, $user)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 'ot', 's', 'r')
            ->leftJoin('o.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.step', 's')
            ->leftJoin('o.Reports', 'r', 'WITH', 'r.Reporter =  :user')
            ->andWhere('o.slug = :opinion')
            ->setParameter('opinion', $opinion)
            ->setParameter('user', $user);

        return $qb->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Get all trashed opinions.
     *
     * @param $consultation
     *
     * @return array
     */
    public function getTrashedByConsultation($consultation)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('ot', 's', 'aut', 'm')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.consultationAbstractStep', 'cas')
            ->andWhere('cas.consultation = :consultation')
            ->andWhere('o.isTrashed = :trashed')
            ->setParameter('consultation', $consultation)
            ->setParameter('trashed', true)
            ->orderBy('o.trashedAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Get all opinions by user.
     *
     * @param $user
     *
     * @return array
     */
    public function getByUser($user)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('ot', 's', 'c', 'aut', 'm')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.consultation', 'c')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->andWhere('c.isEnabled = :enabled')
            ->andWhere('s.isEnabled = :enabled')
            ->andWhere('o.Author = :author')
            ->setParameter('enabled', true)
            ->setParameter('author', $user)
            ->orderBy('o.createdAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Count opinions by user.
     *
     * @param $user
     *
     * @return mixed
     */
    public function countByUser($user)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(o) as totalOpinions')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.consultation', 'c')
            ->andWhere('s.isEnabled = :enabled')
            ->andWhere('c.isEnabled = :enabled')
            ->andWhere('o.isEnabled = :enabled')
            ->andWhere('o.Author = :author')
            ->setParameter('enabled', true)
            ->setParameter('author', $user);

        return $qb
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Get opinions by opinionType and consultation step.
     *
     * @param $step
     * @param $opinionType
     * @param int $nbByPage
     * @param int $page
     *
     * @return Paginator
     * @return mixed
     */
    public function getByOpinionTypeAndConsultationStepOrdered($step, $opinionType, $nbByPage = 10, $page = 1, $opinionsSort = null)
    {
        if ((int) $page < 1) {
            throw new \InvalidArgumentException(sprintf(
                    'The argument "page" cannot be lower than 1 (current value: "%s")',
                    $page
                ));
        }

        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('ot', 's', 'aut', 'm', '(o.voteCountMitige + o.voteCountOk + o.voteCountNok) as HIDDEN vnb')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.step', 's')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->andWhere('o.step = :step')
            ->andWhere('o.OpinionType = :opinionType')
            ->andWhere('o.isTrashed = :notTrashed')
            ->setParameter('step', $step)
            ->setParameter('opinionType', $opinionType)
            ->setParameter('notTrashed', false)
            ->orderBy('o.pinned', 'DESC')
        ;

        if ($opinionsSort) {
            if ($opinionsSort == 'date') {
                $qb->addOrderBy('o.updatedAt', 'DESC');
            } elseif ($opinionsSort == 'votes') {
                $qb->addOrderBy('vnb', 'DESC');
            } elseif ($opinionsSort == 'comments') {
                $qb->addOrderBy('o.argumentsCount', 'DESC');
            } elseif ($opinionsSort == 'positions') {
                $qb->addOrderBy('o.position', 'ASC');
            }
        }

        $qb->addOrderBy('vnb', 'DESC')
            ->addOrderBy('o.argumentsCount', 'DESC')
            ->addOrderBy('o.updatedAt', 'DESC');

        $query = $qb->getQuery()
            ->setFirstResult(($page - 1) * $nbByPage)
            ->setMaxResults($nbByPage);

        return new Paginator($query);
    }

    /**
     * Get all opinions by consultation step.
     *
     * @param $step
     *
     * @return mixed
     */
    public function getByConsultationStepAndOpinionTypeOrdered($step, $ot, $limit = 5, $opinionsSort = null)
    {
        $qb = $this->getIsEnabledQueryBuilder('o')
            ->addSelect('ot', 'aut', '(o.voteCountMitige + o.voteCountOk + o.voteCountNok) as HIDDEN vnb')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.Author', 'aut')
            ->andWhere('o.step = :step')
            ->andWhere('ot.id = :ot')
            ->andWhere('o.isTrashed = :notTrashed')
            ->setParameter('step', $step)
            ->setParameter('ot', $ot)
            ->setParameter('notTrashed', false)
            ->orderBy('o.pinned', 'DESC')
        ;

        if ($opinionsSort) {
            if ($opinionsSort == 'date') {
                $qb->addOrderBy('o.updatedAt', 'DESC');
            } elseif ($opinionsSort == 'votes') {
                $qb->addOrderBy('vnb', 'DESC');
            } elseif ($opinionsSort == 'comments') {
                $qb->addOrderBy('o.argumentsCount', 'DESC');
            } elseif ($opinionsSort == 'positions') {
                $qb->addOrderBy('o.position', 'ASC');
            }
        }

        $qb->addOrderBy('vnb', 'DESC')
            ->setMaxResults($limit);

        return $qb
            ->getQuery()
            ->getResult();
    }

    /**
     * Get enabled opinions by consultation step.
     *
     * @param $step
     *
     * @return mixed
     */
    public function getEnabledByConsultationStep($step)
    {
        $qb = $this->getIsEnabledQueryBuilder('o')
            ->addSelect('ot', 'aut', 'arg')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('o.arguments', 'arg')
            ->andWhere('o.step = :step')
            ->setParameter('step', $step)
            ->addOrderBy('o.updatedAt', 'DESC');

        return $qb
            ->getQuery()
            ->getResult();
    }

    protected function getIsEnabledQueryBuilder($alias = 'o')
    {
        return $this->createQueryBuilder($alias)
            ->andWhere($alias.'.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
