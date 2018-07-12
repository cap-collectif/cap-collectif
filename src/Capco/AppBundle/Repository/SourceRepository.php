<?php
namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Model\Sourceable;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\Tools\Pagination\Paginator;

class SourceRepository extends EntityRepository
{
    use ContributionRepositoryTrait;

    public function getRecentOrdered()
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                's.id',
                's.title',
                's.createdAt',
                's.updatedAt',
                'a.username as author',
                'ut.name as userType',
                's.isEnabled as published',
                's.isTrashed as trashed'
            )
            ->where('s.validated = :validated')
            ->leftJoin('s.Author', 'a')
            ->leftJoin('a.userType', 'ut')
            ->setParameter('validated', false);
        return $qb->getQuery()->getArrayResult();
    }

    public function getByContributionQB(Sourceable $sourceable)
    {
        $qb = $this->getIsEnabledQueryBuilder();

        if ($sourceable instanceof Opinion) {
            $qb->andWhere('s.Opinion = :opinion')->setParameter('opinion', $sourceable->getId());
        }
        if ($sourceable instanceof OpinionVersion) {
            $qb
                ->andWhere('s.opinionVersion = :version')
                ->setParameter('version', $sourceable->getId());
        }

        return $qb;
    }

    public function countByContribution(Sourceable $sourceable): int
    {
        $qb = $this->getByContributionQB($sourceable);
        $qb->select('COUNT(s.id)');
        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function getByContribution(
        Sourceable $sourceable,
        int $limit,
        int $first,
        string $field,
        string $direction
    ): Paginator {
        $qb = $this->getByContributionQB($sourceable);

        if ('CREATED_AT' === $field) {
            $qb->addOrderBy('s.createdAt', $direction);
        }

        if ('VOTES' === $field) {
            $qb->addOrderBy('s.votesCount', $direction);
        }

        $qb->setFirstResult($first)->setMaxResults($limit);
        return new Paginator($qb);
    }

    public function getAllByOpinion(string $opinionId, $asArray = false)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('aut', 'ut', 'cat', 'media')
            ->leftJoin('s.Author', 'aut')
            ->leftJoin('aut.userType', 'ut')
            ->leftJoin('s.Category', 'cat')
            ->leftJoin('s.media', 'media')
            ->andWhere('s.Opinion = :opinion')
            ->setParameter('opinion', $opinionId);
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
            ->addSelect('aut', 'ut', 'cat', 'media')
            ->leftJoin('s.Author', 'aut')
            ->leftJoin('aut.userType', 'ut')
            ->leftJoin('s.Category', 'cat')
            ->leftJoin('s.media', 'media')
            ->andWhere('s.opinionVersion = :version')
            ->setParameter('version', $versionId);
        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    public function getArrayById(string $id)
    {
        $qb = $this->createQueryBuilder('s')
            ->select(
                's.id',
                's.title',
                's.createdAt',
                's.updatedAt',
                'a.username as author',
                's.isEnabled as published',
                's.isTrashed as trashed',
                's.body as body'
            )
            ->leftJoin('s.Author', 'a')
            ->where('s.id = :id')
            ->setParameter('id', $id);
        return $qb->getQuery()->getOneOrNullResult(Query::HYDRATE_ARRAY);
    }

    public function getByOpinion(Opinion $opinion, $offset, $limit, $filter, $trashed = false)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('ca', 'o', 'aut', 'm', 'media')
            ->leftJoin('s.Category', 'ca')
            ->leftJoin('s.media', 'media')
            ->leftJoin('s.Opinion', 'o')
            ->leftJoin('s.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->andWhere('s.isTrashed = :trashed')
            ->andWhere('s.Opinion = :opinion')
            ->setParameter('opinion', $opinion)
            ->setParameter('trashed', $trashed);
        if ('old' === $filter) {
            $qb->addOrderBy('s.updatedAt', 'ASC');
        }

        if ('last' === $filter) {
            $qb->addOrderBy('s.updatedAt', 'DESC');
        }

        if ('popular' === $filter) {
            $qb->addOrderBy('s.votesCount', 'DESC');
            $qb->addOrderBy('s.updatedAt', 'DESC');
        }

        return $qb->getQuery()->getResult();
    }

    public function getByOpinionVersion(
        OpinionVersion $version,
        $offset,
        $limit,
        $filter,
        $trashed = false
    ) {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('ca', 'o', 'aut', 'm', 'media')
            ->leftJoin('s.Category', 'ca')
            ->leftJoin('s.media', 'media')
            ->leftJoin('s.Opinion', 'o')
            ->leftJoin('s.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->andWhere('s.isTrashed = :trashed')
            ->andWhere('s.opinionVersion = :version')
            ->setParameter('version', $version)
            ->setParameter('trashed', $trashed);
        if ('old' === $filter) {
            $qb->addOrderBy('s.updatedAt', 'ASC');
        }

        if ('last' === $filter) {
            $qb->addOrderBy('s.updatedAt', 'DESC');
        }

        if ('popular' === $filter) {
            $qb->addOrderBy('s.votesCount', 'DESC');
            $qb->addOrderBy('s.updatedAt', 'DESC');
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Get one source by slug.
     *
     * @param $source
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return mixed
     */
    public function getOneBySlug(string $slug)
    {
        return $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 'v', 'o', 'cat', 'media')
            ->leftJoin('s.Author', 'a')
            ->leftJoin('s.media', 'media')
            ->leftJoin('s.Category', 'cat')
            ->leftJoin('a.media', 'm')
            ->leftJoin('s.votes', 'v')
            ->leftJoin('s.Opinion', 'o')
            ->andWhere('s.slug = :slug')
            ->setParameter('slug', $slug)

            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countByAuthorAndProject(User $author, Project $project): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(DISTINCT s)')
            ->leftJoin('s.Opinion', 'o')
            ->leftJoin('s.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('o.step', 'ostep')
            ->leftJoin('ovo.step', 'ovostep')
            ->leftJoin('ostep.projectAbstractStep', 'opas')
            ->leftJoin('ovostep.projectAbstractStep', 'ovopas')
            ->andWhere('opas.project = :project OR ovopas.project = :project')
            ->andWhere('s.Author = :author')
            ->setParameter('project', $project)
            ->setParameter('author', $author);
        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countByAuthorAndStep(User $author, ConsultationStep $step): int
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(DISTINCT s)')
            ->leftJoin('s.Opinion', 'o')
            ->leftJoin('s.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere('o.step = :step OR ovo.step = :step')
            ->andWhere('s.Author = :author')
            ->setParameter('step', $step)
            ->setParameter('author', $author);
        return $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Get all trashed or unpublished sources for project.
     */
    public function getTrashedOrUnpublishedByProject(Project $project)
    {
        $qb = $this->createQueryBuilder('s')
            ->addSelect('ca', 'o', 'aut', 'm', 'media')
            ->leftJoin('s.Category', 'ca')
            ->leftJoin('s.media', 'media')
            ->leftJoin('s.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('s.Opinion', 'o')
            ->leftJoin('s.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->leftJoin('o.step', 'ostep')
            ->leftJoin('ovo.step', 'ovostep')
            ->leftJoin('ostep.projectAbstractStep', 'opas')
            ->leftJoin('ovostep.projectAbstractStep', 'ovopas')
            ->andWhere('opas.project = :project OR ovopas.project = :project')
            ->andWhere('s.isTrashed = :trashed OR s.isEnabled = :disabled')
            ->setParameter('project', $project)
            ->setParameter('trashed', true)
            ->setParameter('disabled', false)
            ->orderBy('s.trashedAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Get sources by opinion with user reports.
     *
     * @param $opinion
     * @param $user
     *
     * @return mixed
     */
    public function getByOpinionJoinUserReports($opinion, $user = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('ca', 'o', 'aut', 'm', 'media', 'r')
            ->leftJoin('s.Category', 'ca')
            ->leftJoin('s.media', 'media')
            ->leftJoin('s.Opinion', 'o')
            ->leftJoin('s.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->leftJoin('s.Reports', 'r', 'WITH', 'r.Reporter =  :user')
            ->andWhere('s.isTrashed = :notTrashed')
            ->andWhere('s.Opinion = :opinion')
            ->setParameter('notTrashed', false)
            ->setParameter('opinion', $opinion)
            ->setParameter('user', $user)
            ->orderBy('s.updatedAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Get enabled sources by project step.
     *
     * @param $step
     * @param mixed $asArray
     *
     * @return mixed
     */
    public function getEnabledByConsultationStep(ConsultationStep $step, $asArray = false)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('ca', 'o', 'ov', 'aut', 'votes')
            ->leftJoin('s.Category', 'ca')
            ->leftJoin('s.Author', 'aut')
            ->leftJoin('s.votes', 'votes')
            ->leftJoin('s.Opinion', 'o')
            ->leftJoin('s.opinionVersion', 'ov')
            ->leftJoin('ov.parent', 'ovo')
            ->andWhere(
                '
                (s.Opinion IS NOT NULL AND o.isEnabled = 1 AND o.step = :step)
                OR
                (s.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovo.step = :step)
            '
            )
            ->setParameter('step', $step)
            ->orderBy('s.updatedAt', 'DESC');

        return $asArray ? $qb->getQuery()->getArrayResult() : $qb->getQuery()->getResult();
    }

    public function countAllByAuthor(User $user): int
    {
        $qb = $this->createQueryBuilder('s');
        $qb
            ->select('count(DISTINCT s)')
            ->andWhere('s.Author = :author')
            ->setParameter('author', $user);
        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findAllByAuthor(User $user): array
    {
        $qb = $this->createQueryBuilder('s');
        $qb->andWhere('s.Author = :author')->setParameter('author', $user);

        return $qb->getQuery()->getResult();
    }

    /**
     * Get sources by user.
     *
     * @param $user
     *
     * @return mixed
     */
    public function getByUser($user)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('ca', 'o', 'cs', 'cas', 'c', 'aut', 'm', 'media')
            ->leftJoin('s.Category', 'ca')
            ->leftJoin('s.media', 'media')
            ->leftJoin('s.Opinion', 'o')
            ->leftJoin('o.step', 'cs')
            ->leftJoin('cs.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->leftJoin('s.Author', 'aut')
            ->leftJoin('aut.media', 'm')
            ->andWhere('s.Author = :author')
            ->andWhere('o.isEnabled = :enabled')
            ->andWhere('cs.isEnabled = :enabled')
            ->andWhere('c.isEnabled = :enabled')
            ->setParameter('author', $user)
            ->setParameter('enabled', true)
            ->orderBy('s.createdAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Count by user.
     *
     * @param $user
     *
     * @return mixed
     */
    public function countByUser($user)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(s) as TotalSources')
            ->leftJoin('s.Opinion', 'o')
            ->leftJoin('o.step', 'cs')
            ->leftJoin('cs.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->andWhere('o.isEnabled = :enabled')
            ->andWhere('cs.isEnabled = :enabled')
            ->andWhere('c.isEnabled = :enabled')
            ->andWhere('s.Author = :author')
            ->setParameter('enabled', true)
            ->setParameter('author', $user);

        return $qb->getQuery()->getSingleScalarResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.isEnabled = true')
            ->andWhere('s.expired = false');
    }
}
