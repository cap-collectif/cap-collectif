<?php
namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Traits\ContributionRepositoryTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ArgumentRepository extends EntityRepository
{
    use ContributionRepositoryTrait;

    public function getRecentOrdered()
    {
        $qb = $this->createQueryBuilder('a')
            ->select(
                'a.id',
                'a.createdAt',
                'a.updatedAt',
                'aut.username as author',
                'ut.name as userType',
                'a.isEnabled as published',
                'a.trashedAt as trashed',
                'c.title as project'
            )
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('aut.userType', 'ut')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c');
        return $qb->getQuery()->getArrayResult();
    }

    public function getArrayById(string $id)
    {
        $qb = $this->createQueryBuilder('a')
            ->select(
                'a.id',
                'a.createdAt',
                'a.updatedAt',
                'aut.username as author',
                'a.isEnabled as published',
                'a.trashedAt as trashed',
                'a.body as body',
                'c.title as project'
            )
            ->leftJoin('a.Author', 'aut')
            ->leftJoin('a.opinion', 'o')
            ->leftJoin('o.step', 's')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->where('a.id = :id')
            ->setParameter('id', $id);
        return $qb->getQuery()->getOneOrNullResult(Query::HYDRATE_ARRAY);
    }

    public function getByContributionAndType(
        Argumentable $contribution,
        ?int $type = null,
        ?int $limit = null,
        ?int $first = null,
        string $field,
        string $direction
    ): Paginator {
        $qb = $this->getByContributionQB($contribution);

        if (null !== $type) {
            $qb->andWhere('a.type = :type')->setParameter('type', $type);
        }

        if ('CREATED_AT' === $field) {
            $qb->addOrderBy('a.createdAt', $direction);
        }

        if ('VOTES' === $field) {
            $qb->addOrderBy('a.votesCount', $direction);
        }

        if ($first) {
            $qb->setFirstResult($first);
        }

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return new Paginator($qb);
    }

    public function countByContributionAndType(Argumentable $contribution, ?int $type = null): int
    {
        $qb = $this->getByContributionQB($contribution);
        $qb->select('COUNT(a.id)');

        if (null !== $type) {
            $qb->andWhere('a.type = :type')->setParameter('type', $type);
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Get all trashed or unpublished arguments for project.
     *
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
            ->andWhere('a.trashedAt IS NOT NULL OR a.isEnabled = :disabled')
            ->setParameter('project', $project)
            ->setParameter('disabled', false)
            ->orderBy('a.trashedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function countAllByAuthor(User $user): int
    {
        $qb = $this->createQueryBuilder('version');
        $qb
            ->select('count(DISTINCT version)')
            ->andWhere('version.Author = :author')
            ->setParameter('author', $user);
        return $qb->getQuery()->getSingleScalarResult();
    }

    public function findAllByAuthor(User $user): array
    {
        $qb = $this->createQueryBuilder('version');
        $qb->andWhere('version.Author = :author')->setParameter('author', $user);

        return $qb->getQuery()->getResult();
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
            ->setParameter('author', $user);
        return $qb->getQuery()->getSingleScalarResult();
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
            ->setParameter(
                'steps',
                array_map(function ($step) {
                    return $step;
                }, $project->getRealSteps())
            )
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
            ->andWhere('a.expired = false');
    }

    private function getByContributionQB(Argumentable $contribution)
    {
        $qb = $this->getIsEnabledQueryBuilder()->andWhere('a.trashedAt IS NULL');
        if ($contribution instanceof Opinion) {
            $qb->andWhere('a.opinion = :opinion')->setParameter('opinion', $contribution);
        }
        if ($contribution instanceof OpinionVersion) {
            $qb
                ->andWhere('a.opinionVersion = :opinionVersion')
                ->setParameter('opinionVersion', $contribution);
        }

        return $qb;
    }
}
