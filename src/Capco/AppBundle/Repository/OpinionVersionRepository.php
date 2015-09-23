<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Consultation;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Opinion;

/**
 * OpinionVersionRepository.
 */
class OpinionVersionRepository extends EntityRepository
{
    public function getEnabledByOpinion(Opinion $opinion, $offset = 0, $limit = 10, $filter = 'last')
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('o', '(o.voteCountMitige + o.voteCountOk + o.voteCountNok) as HIDDEN vnb')
            ->leftJoin('o.author', 'author')
            ->leftJoin('author.Media', 'm')
            ->leftJoin('o.votes', 'v')
            ->andWhere('o.parent = :opinion')
            ->andWhere('o.isTrashed = false')
            ->setParameter('opinion', $opinion)
        ;

        if ($filter == 'last') {
            $qb->orderBy('o.updatedAt', 'DESC');
            $qb->addOrderBy('o.voteCountOk', 'DESC');
        } elseif ($filter == 'old') {
            $qb->orderBy('o.updatedAt', 'ASC');
            $qb->addOrderBy('o.voteCountOk', 'DESC');
        } elseif ($filter == 'favorable') {
            $qb->orderBy('o.voteCountOk', 'DESC');
            $qb->addOrderBy('o.voteCountNok', 'ASC');
            $qb->addOrderBy('o.updatedAt', 'DESC');
        } elseif ($filter == 'votes') {
            $qb->orderBy('vnb', 'DESC');
            $qb->addOrderBy('o.updatedAt', 'DESC');
        } elseif ($filter == 'comments') {
            $qb->orderBy('o.argumentsCount', 'DESC');
            $qb->addOrderBy('o.updatedAt', 'DESC');
        } elseif ($filter == 'positions') {
            $qb->orderBy('o.position', 'ASC');
            $qb->addOrderBy('o.updatedAt', 'DESC');
        }

        $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        return new Paginator($qb);
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
        $qb = $this->getIsEnabledQueryBuilder('ov')
            ->addSelect('o', 'ot', 'aut', 'arg', 'sources', 'votes')
            ->leftJoin('ov.parent', 'o')
            ->leftJoin('ov.author', 'aut')
            ->leftJoin('ov.arguments', 'arg')
            ->leftJoin('ov.sources', 'sources')
            ->leftJoin('ov.votes', 'votes')
            ->leftJoin('o.OpinionType', 'ot')
            ->andWhere('o.step = :step')
            ->setParameter('step', $step)
            ->addOrderBy('ov.updatedAt', 'DESC');

        return $qb
            ->getQuery()
            ->getResult();
    }

    /**
     * Get all versions in a consultation.
     *
     * @param $consultation
     * @param $orderByRanking
     * @param $limit
     * @param $page
     *
     * @return mixed
     */
    public function getEnabledByConsultation($consultation, $orderByRanking = false, $limit = null, $page = 1)
    {
        $qb = $this->getIsEnabledQueryBuilder('ov')
            ->addSelect('o', 'ot', 's', 'aut', 'm')
            ->leftJoin('ov.parent', 'o')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.consultationAbstractStep', 'cas')
            ->andWhere('cas.consultation = :consultation')
            ->andWhere('ov.isTrashed = :trashed')
            ->setParameter('consultation', $consultation)
            ->setParameter('trashed', false)
        ;

        if ($orderByRanking) {
            $qb->orderBy('ov.ranking', 'ASC');
        }

        $qb->addOrderBy('ov.updatedAt', 'DESC');

        if ($limit !== null && is_int($limit) && 0 < $limit) {
            $query = $qb->getQuery()
                ->setFirstResult(($page - 1) * $limit)
                ->setMaxResults($limit)
            ;

            return new Paginator($query);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Get all versions by consultation ordered by votesCountOk.
     *
     * @param $consultation
     *
     * @return mixed
     */
    public function getEnabledByConsultationsOrderedByVotes(Consultation $consultation)
    {
        $qb = $this->getIsEnabledQueryBuilder('ov')
            ->innerJoin('ov.parent', 'o')
            ->innerJoin('o.step', 's')
            ->innerJoin('s.consultationAbstractStep', 'cas')
            ->innerJoin('cas.consultation', 'c')
            ->andWhere('ov.isTrashed = :trashed')
            ->andWhere('cas.consultation = :consultation')
            ->setParameter('trashed', false)
            ->setParameter('consultation', $consultation)
            ->orderBy('ov.voteCountOk', 'DESC')
            ->addOrderBy('ov.updatedAt', 'DESC')
        ;

        return $qb->getQuery()->getResult();
    }

    protected function getIsEnabledQueryBuilder($alias = 'o')
    {
        return $this->createQueryBuilder($alias)
                    ->andWhere($alias.'.enabled = true')
                ;
    }
}
