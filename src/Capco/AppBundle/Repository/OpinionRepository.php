<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Project;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\Tools\Pagination\Paginator;

class OpinionRepository extends EntityRepository
{
    public function getRecentOrdered()
    {
        $qb = $this->createQueryBuilder('o')
            ->select('o.id', 'o.title', 'o.createdAt', 'o.updatedAt', 'a.username as author', 'o.isEnabled as published', 'o.isTrashed as trashed', 'c.title as project')
            ->where('o.validated = :validated')
            ->leftJoin('o.Author', 'a')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->setParameter('validated', false)
        ;

        return $qb->getQuery()
            ->getArrayResult()
        ;
    }

    public function getArrayById(string $id)
    {
        $qb = $this->createQueryBuilder('o')
            ->select('o.id', 'o.title', 'o.createdAt', 'o.updatedAt', 'a.username as author', 'o.isEnabled as published', 'o.isTrashed as trashed', 'o.body as body', 'c.title as project')
            ->leftJoin('o.Author', 'a')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->where('o.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb->getQuery()
            ->getOneOrNullResult(Query::HYDRATE_ARRAY)
        ;
    }

    public function getOne(string $id)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 'ot', 's', 'appendix', 'childConnections', 'parentConnections')
            ->leftJoin('o.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.step', 's')
            ->leftJoin('o.appendices', 'appendix')
            ->leftJoin('o.childConnections', 'childConnections')
            ->leftJoin('o.parentConnections', 'parentConnections')
            ->andWhere('o.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getWithArguments(string $id)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('argument')
            ->innerJoin('o.arguments', 'argument', 'WITH', 'argument.isTrashed = false')
            ->andWhere('o.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getWithSources(string $id)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('source')
            ->innerJoin('o.Sources', 'source', 'WITH', 'source.isTrashed = false')
            ->andWhere('o.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getWithVotes(string $id, $limit = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('vote')
            ->innerJoin('o.votes', 'vote')
            ->andWhere('o.id = :id')
            ->setParameter('id', $id)
        ;

        if (null !== $limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * Get one opinion by slug.
     *
     * @param $opinion
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return mixed
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
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return mixed
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
     * Get all opinions in a project.
     *
     * @param $project
     * @param $excludedAuthor
     * @param $orderByRanking
     * @param $limit
     * @param $page
     *
     * @return mixed
     */
    public function getEnabledByProject($project, $excludedAuthor = null, $orderByRanking = false, $limit = null, $page = 1)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('ot', 's', 'aut', 'm')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->andWhere('cas.project = :project')
            ->andWhere('o.isTrashed = :trashed')
            ->setParameter('project', $project)
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
                ->orderBy('o.ranking', 'ASC')
                ->addOrderBy('o.votesCountOk', 'DESC')
                ->addOrderBy('o.votesCountNok', 'ASC')
                ->addOrderBy('o.updatedAt', 'DESC')
            ;
        }

        $qb->addOrderBy('o.updatedAt', 'DESC');

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
     * Get all trashed or unpublished opinions.
     *
     * @param $project
     *
     * @return array
     */
    public function getTrashedOrUnpublishedByProject(Project $project)
    {
        $qb = $this->createQueryBuilder('o')
            ->addSelect('ot', 's', 'aut', 'm')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->andWhere('pas.project = :project')
            ->andWhere('o.isTrashed = true')
            ->setParameter('project', $project)
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
            ->leftJoin('s.project', 'c')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->andWhere('c.isEnabled = true')
            ->andWhere('s.isEnabled = true')
            ->andWhere('o.Author = :author')
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
            ->leftJoin('s.project', 'c')
            ->andWhere('s.isEnabled = true')
            ->andWhere('c.isEnabled = true')
            ->andWhere('o.isEnabled = true')
            ->andWhere('o.Author = :author')
            ->setParameter('author', $user);

        return $qb
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countByOpinionType(string $opinionTypeId): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(o)')
            ->andWhere('o.isTrashed = false')
            ->andWhere('o.OpinionType = :opinionTypeId')
            ->setParameter('opinionTypeId', $opinionTypeId);

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            // ->useResultCache(true, 60)
            ->getSingleScalarResult();
    }

    public function getByStepOrdered(array $criteria, array $orderBy, $limit = 50, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->addOrderBy('o.pinned', 'DESC') // Pinned always come first
        ;

        if ($criteria['step']) {
            $qb
              ->andWhere('o.step = :step')
              ->setParameter('step', $criteria['step'])
            ;
        }

        if ($criteria['trashed']) {
            $qb
                ->andWhere('o.isTrashed = :trashed')
                ->setParameter('trashed', $criteria['trashed'])
            ;
        }

        $sortField = array_keys($orderBy)[0];
        $direction = $orderBy[$sortField];

        if ($sortField === 'CREATED_AT') {
            $qb
                    ->addOrderBy('o.createdAt', $direction)
                    ->addOrderBy('o.votesCountOk', 'DESC')
                ;
        }
        if ($sortField === 'POPULAR') {
            if ($direction === 'DESC') {
                $qb
                      ->addOrderBy('o.votesCountOk', 'DESC')
                      ->addOrderBy('o.votesCountNok', 'ASC')
                    ;
            }
            if ($direction === 'ASC') {
                $qb
                       ->addOrderBy('o.votesCountNok', 'DESC')
                       ->addOrderBy('o.votesCountOk', 'ASC')
                     ;
            }
            $qb->addOrderBy('o.createdAt', 'DESC');
        }
        if ($sortField === 'VOTE_COUNT') {
            $qb
                    ->addSelect('(o.votesCountMitige + o.votesCountOk + o.votesCountNok) as HIDDEN vnb')
                    ->addOrderBy('vnb', $direction)
                    ->addOrderBy('o.createdAt', 'DESC')
                ;
        }
        if ($sortField === 'COMMENT_COUNT') {
            $qb
                    ->addOrderBy('o.argumentsCount', $direction)
                    ->addOrderBy('o.createdAt', 'DESC')
                ;
        }
        if ($sortField === 'POSITION') {
            $qb
                    // trick in DQL to order NULL values last
                    ->addSelect('-o.position as HIDDEN inversePosition')
                    ->addOrderBy('inversePosition', $direction)
                    ->addSelect('RAND() as HIDDEN rand')
                    ->addOrderBy('rand')
                ;
        }
        if ($sortField === 'RANDOM') {
            $qb
                    ->addSelect('RAND() as HIDDEN rand')
                    ->addOrderBy('rand')
                ;
        }

        $query = $qb->getQuery()
                    ->setFirstResult($offset)
                    ->setMaxResults($limit)
                    ->useQueryCache(true)
                    // ->useResultCache(true, 60)
        ;

        return new Paginator($query);
    }

    /**
     * Get opinions by opinionType.
     *
     * @param $opinionTypeId
     * @param int    $nbByPage
     * @param int    $page
     * @param string $opinionsSort
     *
     * @return Paginator
     */
    public function getByOpinionTypeOrdered($opinionTypeId, $nbByPage = 10, $page = 1, $opinionsSort = 'positions')
    {
        if ($page < 1) {
            throw new \InvalidArgumentException(sprintf(
                'The argument "page" cannot be lower than 1 (current value: "%s")',
                $page
            ));
        }

        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('ot', 'aut', 'm', '(o.votesCountMitige + o.votesCountOk + o.votesCountNok) as HIDDEN vnb')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->andWhere('ot.id = :opinionType')
            ->andWhere('o.isTrashed = false')
            ->setParameter('opinionType', $opinionTypeId)
            ->addOrderBy('o.pinned', 'DESC')
        ;

        if ($opinionsSort) {
            if ($opinionsSort === 'last') {
                $qb
                    ->addOrderBy('o.createdAt', 'DESC')
                    ->addOrderBy('o.votesCountOk', 'DESC')
                ;
            } elseif ($opinionsSort === 'old') {
                $qb
                    ->addOrderBy('o.createdAt', 'ASC')
                    ->addOrderBy('o.votesCountOk', 'DESC')
                ;
            } elseif ($opinionsSort === 'favorable') {
                $qb
                    ->addOrderBy('o.votesCountOk', 'DESC')
                    ->addOrderBy('o.votesCountNok', 'ASC')
                    ->addOrderBy('o.createdAt', 'DESC')
                ;
            } elseif ($opinionsSort === 'votes') {
                $qb
                    ->addOrderBy('vnb', 'DESC')
                    ->addOrderBy('o.createdAt', 'DESC')
                ;
            } elseif ($opinionsSort === 'comments') {
                $qb
                    ->addOrderBy('o.argumentsCount', 'DESC')
                    ->addOrderBy('o.createdAt', 'DESC')
                ;
            } elseif ($opinionsSort === 'positions') {
                $qb
                    // trick in DQL to order NULL values last
                    ->addSelect('-o.position as HIDDEN inversePosition')
                    ->addOrderBy('inversePosition', 'DESC')

                    ->addSelect('RAND() as HIDDEN rand')
                    ->addOrderBy('rand')
                ;
            } elseif ($opinionsSort === 'random') {
                $qb
                    ->addSelect('RAND() as HIDDEN rand')
                    ->addOrderBy('rand')
                ;
            }
        }

        $query = $qb
                    ->getQuery()
                    ->setFirstResult(($page - 1) * $nbByPage)
                    ->setMaxResults($nbByPage)
        ;

        $query->useQueryCache(true);
        // $query->useResultCache(true, 60);

        return new Paginator($query);
    }

    /**
     * Get enabled opinions by consultation step.
     *
     * @param $step
     * @param mixed $asArray
     *
     * @return mixed
     */
    public function getEnabledByConsultationStep($step, $asArray = false)
    {
        $qb = $this->getIsEnabledQueryBuilder('o')
            ->addSelect('ot', 'aut', 'ut', 'app', 'apptype', 'args')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('o.Author', 'aut')
            ->leftJoin('aut.userType', 'ut')
            ->leftJoin('o.appendices', 'app')
            ->leftJoin('app.appendixType', 'apptype')
            ->leftJoin('o.arguments', 'args')
            ->andWhere('o.step = :step')
            ->setParameter('step', $step)
            ->addOrderBy('o.updatedAt', 'DESC')
        ;

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    /**
     * Get all opinions by project ordered by votesCountOk.
     *
     * @param $project
     * @param $excludedAuthor
     *
     * @return mixed
     */
    public function getEnabledByProjectsOrderedByVotes(Project $project, $excludedAuthor = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->innerJoin('o.step', 's')
            ->innerJoin('s.projectAbstractStep', 'cas')
            ->innerJoin('cas.project', 'c')
            ->andWhere('o.isTrashed = false')
            ->andWhere('cas.project = :project')
            ->setParameter('project', $project)
        ;

        if ($excludedAuthor !== null) {
            $qb
                ->innerJoin('o.Author', 'a')
                ->andWhere('a.id != :author')
                ->setParameter('author', $excludedAuthor)
            ;
        }

        $qb
            ->orderBy('o.votesCountOk', 'DESC')
        ;

        return $qb->getQuery()->getResult();
    }

    protected function getIsEnabledQueryBuilder($alias = 'o')
    {
        return $this->createQueryBuilder($alias)
            ->andWhere($alias . '.isEnabled = true')
            ->andWhere($alias . '.expired = false')
        ;
    }
}
