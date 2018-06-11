<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;

class ArgumentRepository extends EntityRepository
{
    use ContributionRepositoryTrait;

    public function getRecentOrdered()
    {
        $qb = $this->createQueryBuilder('a')
            ->select('a.id', 'a.createdAt', 'a.updatedAt', 'aut.username as author', 'ut.name as userType', 'a.isEnabled as published', 'a.isTrashed as trashed', 'c.title as project')
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('aut.userType', 'ut')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->where('a.validated = :validated')
            ->setParameter('validated', false)
        ;

        return $qb->getQuery()
            ->getArrayResult()
        ;
    }

    public function getArrayById(string $id)
    {
        $qb = $this->createQueryBuilder('a')
            ->select('a.id', 'a.createdAt', 'a.updatedAt', 'aut.username as author', 'a.isEnabled as published', 'a.isTrashed as trashed', 'a.body as body', 'c.title as project')
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->where('a.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb->getQuery()
            ->getOneOrNullResult(Query::HYDRATE_ARRAY)
        ;
    }

    /**
     * Get all enabled arguments by type and opinion, sorted by argumentSort.
     *
     * @param mixed      $opinion
     * @param null|mixed $type
     * @param null|mixed $argumentSort
     * @param null|mixed $user
     */

    /**
     * @param $type
     * @param $opinion
     * @param null $argumentSort
     *
     * @return array
     */
    public function getByTypeAndOpinionOrderedJoinUserReports($opinion, $type = null, $argumentSort = null, $user = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v')
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('a.votes', 'v')
            ->andWhere('a.isTrashed = false')
            ->andWhere('a.opinion = :opinion')
            ->setParameter('opinion', $opinion)
        ;

        if (null !== $type) {
            $qb
                ->andWhere('a.type = :type')
                ->setParameter('type', $type)
            ;
        }

        if (null !== $user) {
            $qb
                ->addSelect('r')
                ->leftJoin('a.Reports', 'r', 'WITH', 'r.Reporter =  :user')
                ->setParameter('user', $user)
            ;
        }

        if (null !== $argumentSort) {
            if ('popular' === $argumentSort) {
                $qb->orderBy('a.votesCount', 'DESC');
            } elseif ('last' === $argumentSort) {
                $qb->orderBy('a.updatedAt', 'DESC');
            } elseif ('old' === $argumentSort) {
                $qb->orderBy('a.updatedAt', 'ASC');
            }
        }

        $qb->addOrderBy('a.updatedAt', 'DESC');

        return $qb->getQuery()
            ->getResult();
    }

    /**
     * Get all enabled arguments by type and opinion version, sorted by argumentSort.
     *
     * @param mixed      $version
     * @param null|mixed $type
     * @param null|mixed $argumentSort
     * @param null|mixed $user
     */

    /**
     * @param $type
     * @param $opinion
     * @param null $argumentSort
     *
     * @return array
     */
    public function getByTypeAndOpinionVersionOrderedJoinUserReports($version, $type = null, $argumentSort = null, $user = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v')
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('a.votes', 'v')
            ->andWhere('a.isTrashed = :notTrashed')
            ->andWhere('a.opinionVersion = :version')
            ->setParameter('notTrashed', false)
            ->setParameter('version', $version)
        ;

        if (null !== $type) {
            $qb
                ->andWhere('a.type = :type')
                ->setParameter('type', $type)
            ;
        }

        if (null !== $user) {
            $qb
                ->addSelect('r')
                ->leftJoin('a.Reports', 'r', 'WITH', 'r.Reporter =  :user')
                ->setParameter('user', $user)
            ;
        }

        if (null !== $argumentSort) {
            if ('popular' === $argumentSort) {
                $qb->orderBy('a.votesCount', 'DESC');
            } elseif ('last' === $argumentSort) {
                $qb->orderBy('a.updatedAt', 'DESC');
            } elseif ('old' === $argumentSort) {
                $qb->orderBy('a.updatedAt', 'ASC');
            }
        }

        $qb->addOrderBy('a.updatedAt', 'DESC');

        return $qb->getQuery()
            ->getResult();
    }

    /**
     * Find enabled arguments by consultation step.
     *
     * @param $step
     * @param mixed $asArray
     *
     * @return array
     */
    public function getEnabledByConsultationStep($step, $asArray = false)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('o', 'ov', 'ovo', 'aut', 'votes', 'vauthor')
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('a.votes', 'votes')
            ->leftJoin('votes.user', 'vauthor')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('a.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere('
                (a.opinion IS NOT NULL AND o.isEnabled = 1 AND o.expired = 0 AND o.step = :step)
                OR
                (a.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ov.expired = 0 AND ovo.isEnabled = 1 AND ovo.expired = 0 AND ovo.step = :step)
            ')
            ->setParameter('step', $step)
            ->addOrderBy('a.updatedAt', 'DESC');

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    /**
     * Get all by opinion.
     *
     * @param $opinionId
     * @param mixed $asArray
     *
     * @return mixed
     */
    public function getAllByOpinion(string $opinionId, $asArray = false)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'ut')
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('aut.userType', 'ut')
            ->andWhere('a.opinion = :opinion')
            ->setParameter('opinion', $opinionId)
        ;

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    /**
     * Get all by version.
     *
     * @param $versionId
     * @param mixed $asArray
     *
     * @return mixed
     */
    public function getAllByVersion(string $versionId, $asArray = false)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'ut')
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('aut.userType', 'ut')
            ->andWhere('a.opinionVersion = :version')
            ->setParameter('version', $versionId)
        ;

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    /**
     * Get one argument by id.
     *
     * @param $argument
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return mixed
     */
    public function getOneById($argument)
    {
        return $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'm', 'v', 'o')
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('a.votes', 'v')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('a.opinionVersion', 'ov')
            ->andWhere('a.id = :argument')
            ->setParameter('argument', $argument)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Get all trashed or unpublished arguments for project.
     *
     * @param $step
     * @param mixed $project
     *
     * @return mixed
     */
    public function getTrashedOrUnpublishedByProject($project)
    {
        return $this->createQueryBuilder('a')
            ->addSelect('o', 'ov', 'v', 'aut', 'm')
            ->leftJoin('a.votes', 'v')
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('a.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('o.step', 'os')
            ->leftJoin('ovo.step', 'ovos')
            ->leftJoin('ovos.projectAbstractStep', 'ovopas')
            ->leftJoin('os.projectAbstractStep', 'opas')
            ->andWhere('opas.project = :project OR ovopas.project = :project')
            ->andWhere('a.isTrashed = :trashed OR a.isEnabled = :disabled')
            ->setParameter('project', $project)
            ->setParameter('trashed', true)
            ->setParameter('disabled', false)
            ->orderBy('a.trashedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Count all arguments by user.
     *
     * @param $user
     *
     * @return mixed
     */
    public function countByUser($user)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(a) as TotalArguments')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->andWhere('a.Author = :author')
            ->andWhere('o.isEnabled = true')
            ->andWhere('s.isEnabled = true')
            ->andWhere('c.isEnabled = true')
            ->setParameter('author', $user)
          ;

        return $qb
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countByAuthorAndProject(User $author, Project $project): int
    {
        return $this->getIsEnabledQueryBuilder()
          ->select('COUNT(DISTINCT a)')
          ->leftJoin('a.opinion', 'o')
          ->leftJoin('a.opinionVersion', 'ov')
          ->leftJoin('ov.parent', 'ovo')
          ->andWhere('o.step IN (:steps) OR ovo.step IN (:steps)')
          ->andWhere('a.Author = :author')
          ->setParameter('steps', array_map(function ($step) {
              return $step;
          }, $project->getRealSteps()))
          ->setParameter('author', $author)
          ->getQuery()
          ->getSingleScalarResult();
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        return $this->getIsEnabledQueryBuilder()
          ->select('COUNT(DISTINCT a)')
          ->leftJoin('a.opinion', 'o')
          ->leftJoin('a.opinionVersion', 'ov')
          ->leftJoin('ov.parent', 'ovo')
          ->andWhere('o.step = :step OR ovo.step = :step')
          ->andWhere('a.Author = :author')
          ->setParameter('step', $step)
          ->setParameter('author', $author)
          ->getQuery()
          ->getSingleScalarResult();
    }

    /**
     * Get all arguments by user.
     *
     * @param mixed $user
     */
    public function getByUser($user)
    {
        return $this->getIsEnabledQueryBuilder()
            ->leftJoin('a.opinion', 'o')
            ->addSelect('o')
            ->leftJoin('o.step', 's')
            ->addSelect('s')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->addSelect('cas')
            ->leftJoin('cas.project', 'p')
            ->addSelect('p')
            ->leftJoin('o.Author', 'aut')
            ->addSelect('aut')
            ->leftJoin('aut.media', 'm')
            ->addSelect('m')
            ->leftJoin('a.votes', 'v')
            ->addSelect('v')
            ->andWhere('a.Author = :author')
            ->andWhere('o.isEnabled = true')
            ->andWhere('s.isEnabled = true')
            ->andWhere('p.isEnabled = true')
            ->setParameter('author', $user)
            ->getQuery()
            ->getResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.isEnabled = true')
            ->andWhere('a.expired = false')
        ;
    }
}
