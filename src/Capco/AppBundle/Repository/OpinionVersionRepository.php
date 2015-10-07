<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Consultation;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Opinion;
use Doctrine\ORM\Query;

/**
 * OpinionVersionRepository.
 */
class OpinionVersionRepository extends EntityRepository
{

    public function getOne($id)
    {
        $qb = $this->getIsEnabledQueryBuilder('o')
            ->addSelect('a', 'm', 'argument', 'source')
            ->leftJoin('o.author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('o.arguments', 'argument', 'WITH', 'argument.isTrashed = false')
            ->leftJoin('o.sources', 'source', 'WITH', 'source.isTrashed = false')
            ->andWhere('o.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getRecentOrdered()
    {
        $qb = $this->createQueryBuilder('o')
            ->select('o.id', 'o.title', 'o.createdAt', 'o.updatedAt', 'a.username as author', 'o.enabled as published', 'o.isTrashed as trashed', 'c.title as consultation')
            ->where('o.validated = :validated')
            ->leftJoin('o.author', 'a')
            ->leftJoin('o.parent', 'op')
            ->leftJoin('op.step', 's')
            ->leftJoin('s.consultationAbstractStep', 'cas')
            ->leftJoin('cas.consultation', 'c')
            ->setParameter('validated', false)
        ;

        return $qb->getQuery()
            ->getArrayResult()
        ;
    }

    public function getArrayById($id)
    {
        $qb = $this->createQueryBuilder('o')
            ->select('o.id', 'o.title', 'o.createdAt', 'o.updatedAt', 'a.username as author', 'o.enabled as published', 'o.isTrashed as trashed', 'CONCAT(CONCAT(o.comment, \'<hr>\'), o.body) as body', 'c.title as consultation')
            ->leftJoin('o.author', 'a')
            ->leftJoin('o.parent', 'op')
            ->leftJoin('op.step', 's')
            ->leftJoin('s.consultationAbstractStep', 'cas')
            ->leftJoin('cas.consultation', 'c')
            ->where('o.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb->getQuery()
            ->getOneOrNullResult(Query::HYDRATE_ARRAY)
        ;
    }

    /**
     * Get trashed or unpublished versions by consultation.
     *
     * @param $consultation
     *
     * @return array
     */
    public function getTrashedOrUnpublishedByConsultation($consultation)
    {
        $qb = $this->createQueryBuilder('o')
            ->addSelect('op', 's', 'aut', 'm')
            ->leftJoin('o.parent', 'op')
            ->leftJoin('op.OpinionType', 'ot')
            ->leftJoin('o.author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('op.step', 's')
            ->leftJoin('s.consultationAbstractStep', 'cas')
            ->andWhere('cas.consultation = :consultation')
            ->andWhere('o.isTrashed = :trashed')
            ->orWhere('o.enabled = :disabled')
            ->setParameter('consultation', $consultation)
            ->setParameter('trashed', true)
            ->setParameter('disabled', false)
            ->orderBy('o.trashedAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    public function getEnabledByOpinion(Opinion $opinion, $offset = 0, $limit = 10, $filter = 'last', $trashed = false)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('o', '(o.voteCountMitige + o.voteCountOk + o.voteCountNok) as HIDDEN vnb')
            ->leftJoin('o.author', 'author')
            ->leftJoin('author.Media', 'm')
            ->leftJoin('o.votes', 'v')
            ->andWhere('o.parent = :opinion')
            ->andWhere('o.isTrashed = :trashed')
            ->setParameter('opinion', $opinion)
            ->setParameter('trashed', $trashed)
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


    public function getByUser($user)
    {
        return $this->getIsEnabledQueryBuilder('ov')
            ->leftJoin('ov.author', 'author')
            ->addSelect('author')
            ->leftJoin('author.Media', 'm')
            ->addSelect('m')
            ->leftJoin('ov.votes', 'votes')
            ->addSelect('votes')
            ->andWhere('ov.author = :author')
            ->setParameter('author', $user)
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
     * @param $excludedAuthor
     * @param $orderByRanking
     * @param $limit
     * @param $page
     *
     * @return mixed
     */
    public function getEnabledByConsultation($consultation, $excludedAuthor = null, $orderByRanking = false, $limit = null, $page = 1)
    {
        $qb = $this->getIsEnabledQueryBuilder('ov')
            ->addSelect('o', 'ot', 's', 'aut', 'm')
            ->leftJoin('ov.parent', 'o')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('ov.author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.consultationAbstractStep', 'cas')
            ->andWhere('cas.consultation = :consultation')
            ->andWhere('ov.isTrashed = :trashed')
            ->setParameter('consultation', $consultation)
            ->setParameter('trashed', false)
        ;

        if ($excludedAuthor !== null) {
            $qb
                ->andWhere('aut.id != :author')
                ->setParameter('author', $excludedAuthor)
            ;
        }

        if ($orderByRanking) {
            $qb
                ->orderBy('ov.ranking', 'ASC')
                ->addOrderBy('ov.voteCountOk', 'DESC')
                ->addOrderBy('ov.voteCountNok', 'ASC')
                ->addOrderBy('ov.updatedAt', 'DESC')
            ;
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
    public function getEnabledByConsultationsOrderedByVotes(Consultation $consultation, $excludedAuthor = null)
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
        ;

        if ($excludedAuthor !== null) {
            $qb
                ->innerJoin('ov.author', 'a')
                ->andWhere('a.id != :author')
                ->setParameter('author', $excludedAuthor)
            ;
        }

        $qb
            ->orderBy('ov.voteCountOk', 'DESC')
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
