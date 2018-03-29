<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\Tools\Pagination\Paginator;

class OpinionVersionRepository extends EntityRepository
{
    public function getAllIds()
    {
        $qb = $this->createQueryBuilder('o')
                  ->select('o.id')
        ;

        return $qb->getQuery()->getArrayResult();
    }

    public function getOne(string $id)
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
            ->select('o.id', 'o.title', 'o.createdAt', 'o.updatedAt', 'a.username as author', 'o.enabled as published', 'o.isTrashed as trashed', 'c.title as project')
            ->where('o.validated = :validated')
            ->leftJoin('o.author', 'a')
            ->leftJoin('o.parent', 'op')
            ->leftJoin('op.step', 's')
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
            ->select('o.id', 'o.title', 'o.createdAt', 'o.updatedAt', 'a.username as author', 'o.enabled as published', 'o.isTrashed as trashed', 'CONCAT(CONCAT(o.comment, \'<hr>\'), o.body) as body', 'c.title as project')
            ->leftJoin('o.author', 'a')
            ->leftJoin('o.parent', 'op')
            ->leftJoin('op.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->where('o.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb->getQuery()
            ->getOneOrNullResult(Query::HYDRATE_ARRAY)
        ;
    }

    /**
     * Get trashed or unpublished versions by project.
     *
     * @param $project
     *
     * @return array
     */
    public function getTrashedOrUnpublishedByProject($project)
    {
        $qb = $this->createQueryBuilder('o')
            ->addSelect('op', 's', 'aut', 'm')
            ->leftJoin('o.parent', 'op')
            ->leftJoin('op.OpinionType', 'ot')
            ->leftJoin('o.author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('op.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->andWhere('pas.project = :project')
            ->andWhere('o.isTrashed = :trashed OR o.enabled = :disabled')
            ->setParameter('project', $project)
            ->setParameter('trashed', true)
            ->setParameter('disabled', false)
            ->orderBy('o.trashedAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    public function getEnabledByOpinion(Opinion $opinion, $filter = 'last', $trashed = false, $offset = 0, $limit = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('o', 'author', 'media', '(o.votesCountMitige + o.votesCountOk + o.votesCountNok) as HIDDEN vnb')
            ->leftJoin('o.author', 'author')
            ->leftJoin('author.Media', 'media')
            ->andWhere('o.parent = :opinion')
            ->andWhere('o.isTrashed = :trashed')
            ->setParameter('opinion', $opinion)
            ->setParameter('trashed', $trashed)
        ;

        if ('last' === $filter) {
            $qb->orderBy('o.updatedAt', 'DESC');
            $qb->addOrderBy('o.votesCountOk', 'DESC');
        } elseif ('old' === $filter) {
            $qb->orderBy('o.updatedAt', 'ASC');
            $qb->addOrderBy('o.votesCountOk', 'DESC');
        } elseif ('favorable' === $filter) {
            $qb->orderBy('o.votesCountOk', 'DESC');
            $qb->addOrderBy('o.votesCountNok', 'ASC');
            $qb->addOrderBy('o.updatedAt', 'DESC');
        } elseif ('votes' === $filter) {
            $qb->orderBy('vnb', 'DESC');
            $qb->addOrderBy('o.updatedAt', 'DESC');
        } elseif ('comments' === $filter) {
            $qb->orderBy('o.argumentsCount', 'DESC');
            $qb->addOrderBy('o.updatedAt', 'DESC');
        } elseif ('random' === $filter) {
            $qb->addSelect('RAND() as HIDDEN rand')
                ->addOrderBy('rand')
            ;
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        if ($limit) {
            $qb->setMaxResults($limit);
        }

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
     * @param mixed $asArray
     *
     * @return mixed
     */
    public function getEnabledByConsultationStep($step, $asArray = false)
    {
        $qb = $this->getIsEnabledQueryBuilder('ov')
            ->addSelect('o', 'ot', 'aut', 'ut', 'args')
            ->leftJoin('ov.parent', 'o')
            ->leftJoin('ov.author', 'aut')
            ->leftJoin('aut.userType', 'ut')
            ->leftJoin('ov.arguments', 'args')
            ->leftJoin('o.OpinionType', 'ot')
            ->andWhere('o.step = :step')
            ->andWhere('o.isEnabled = 1')
            ->setParameter('step', $step)
            ->addOrderBy('ov.updatedAt', 'DESC');

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    public function countByAuthorAndProject(User $author, Project $project): int
    {
        $qb = $this->getIsEnabledQueryBuilder('version')
          ->select('count(DISTINCT version)')
          ->leftJoin('version.parent', 'opinion')
          ->andWhere('version.author = :author')
          ->andWhere('opinion.step IN (:steps)')
          ->setParameter('steps', array_map(function ($step) {
              return $step;
          }, $project->getRealSteps()))
          ->setParameter('author', $author)
      ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        $qb = $this->getIsEnabledQueryBuilder('version')
          ->select('count(DISTINCT version)')
          ->leftJoin('version.parent', 'opinion')
          ->andWhere('opinion.step = :step')
          ->andWhere('version.author = :author')
          ->setParameter('step', $step)
          ->setParameter('author', $author)
      ;

        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Get all versions in a project.
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
        $qb = $this->getIsEnabledQueryBuilder('ov')
            ->addSelect('o', 'ot', 's', 'aut', 'm')
            ->leftJoin('ov.parent', 'o')
            ->leftJoin('o.OpinionType', 'ot')
            ->leftJoin('ov.author', 'aut')
            ->leftJoin('aut.Media', 'm')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->andWhere('cas.project = :project')
            ->andWhere('ov.isTrashed = :trashed')
            ->setParameter('project', $project)
            ->setParameter('trashed', false)
        ;

        if (null !== $excludedAuthor) {
            $qb
                ->andWhere('aut.id != :author')
                ->setParameter('author', $excludedAuthor)
            ;
        }

        if ($orderByRanking) {
            $qb
                ->orderBy('ov.ranking', 'ASC')
                ->addOrderBy('ov.votesCountOk', 'DESC')
                ->addOrderBy('ov.votesCountNok', 'ASC')
                ->addOrderBy('ov.updatedAt', 'DESC')
            ;
        }

        $qb->addOrderBy('ov.updatedAt', 'DESC');

        if (null !== $limit && is_int($limit) && 0 < $limit) {
            $query = $qb->getQuery()
                ->setFirstResult(($page - 1) * $limit)
                ->setMaxResults($limit)
            ;

            return new Paginator($query);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Get all versions by project ordered by votesCountOk.
     *
     * @param $project
     * @param null|mixed $excludedAuthor
     *
     * @return mixed
     */
    public function getEnabledByProjectsOrderedByVotes(Project $project, $excludedAuthor = null)
    {
        $qb = $this->getIsEnabledQueryBuilder('ov')
            ->innerJoin('ov.parent', 'o')
            ->innerJoin('o.step', 's')
            ->innerJoin('s.projectAbstractStep', 'cas')
            ->innerJoin('cas.project', 'c')
            ->andWhere('ov.isTrashed = :trashed')
            ->andWhere('cas.project = :project')
            ->setParameter('trashed', false)
            ->setParameter('project', $project)
        ;

        if (null !== $excludedAuthor) {
            $qb
                ->innerJoin('ov.author', 'a')
                ->andWhere('a.id != :author')
                ->setParameter('author', $excludedAuthor)
            ;
        }

        $qb
            ->orderBy('ov.votesCountOk', 'DESC')
        ;

        return $qb->getQuery()->getResult();
    }

    public function getWithVotes(string $id, $limit = null)
    {
        $qb = $this->getIsEnabledQueryBuilder('o')
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

    protected function getIsEnabledQueryBuilder($alias = 'o')
    {
        return $this
            ->createQueryBuilder($alias)
            ->andWhere($alias . '.enabled = true')
            ->andWhere($alias . '.expired = false')
        ;
    }
}
