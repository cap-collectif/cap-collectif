<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\QueryBuilder;
use Exception;

trait ContributionRepositoryTrait
{
    /**
     * @throws Exception
     *
     * @return array<int, object>
     */
    public function findCreatedSinceIntervalByAuthor(
        User $author,
        string $interval,
        string $authorField = 'author'
    ): array {
        $now = new \DateTime();
        $from = (new \DateTime())->sub(new \DateInterval($interval));

        $qb = $this->createQueryBuilder('o');
        $qb->andWhere($qb->expr()->between('o.createdAt', ':from', ':to'))
            ->andWhere('o.' . $authorField . ' = :author')
            ->setParameters(['from' => $from, 'to' => $now, 'author' => $author])
        ;

        return $qb->getQuery()->getArrayResult();
    }

    public function searchByBodyOrAuthorUsername(QueryBuilder $qb, string $search, string $alias): void
    {
        $qb->leftJoin("{$alias}.author", 'a')
            ->andWhere("{$alias}.body LIKE :search OR a.username LIKE :search")
            ->setParameter('search', "%{$search}%")
        ;
    }

    public function countPublished(): int
    {
        $qb = $this->createQueryBuilder('o');
        $qb->select('count(DISTINCT o.id)')->andWhere('o.published = true');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function countUnpublished(): int
    {
        $qb = $this->createQueryBuilder('o');
        $qb->select('count(DISTINCT o.id)')->andWhere('o.published = false');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    // Only for trashable contribution
    public function countTrashed(): int
    {
        $qb = $this->createQueryBuilder('o');
        $qb->select('count(DISTINCT o.id)')->andWhere('o.trashedAt IS NOT NULL');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @return array<int, object>
     */
    public function getVotesByProject(Project $project): array
    {
        $steps = $project->getSteps();
        $stepIds = array_map(
            static fn ($projectAbstractStep) => $projectAbstractStep->getStep()->getId(),
            $steps->toArray()
        );

        $qb = $this->createQueryBuilder('v');
        $qb->leftJoin('v.proposal', 'p')
            ->leftJoin('p.proposalForm', 'pf')
            ->leftJoin('pf.step', 'pfs')
            ->andWhere($qb->expr()->in('pfs.id', ':stepIds'))
        ;

        $qb->setParameters([
            ':stepIds' => $stepIds,
        ]);

        return $qb->getQuery()->getResult();
    }

    public function getContributionsViewerCanSee(
        QueryBuilder $qb,
        User $viewer,
        string $viewerParamName = 'viewer'
    ): QueryBuilder {
        $qb->andWhere(
            $qb
                ->expr()
                ->orX(
                    $qb
                        ->expr()
                        ->orX(
                            $qb
                                ->expr()
                                ->eq('pro.visibility', ProjectVisibilityMode::VISIBILITY_PUBLIC),
                            $qb->expr()->eq(':' . $viewerParamName, 'pr_au.user')
                        ),
                    $qb
                        ->expr()
                        ->andX(
                            $qb
                                ->expr()
                                ->eq('pro.visibility', ProjectVisibilityMode::VISIBILITY_CUSTOM),
                            $qb->expr()->in('prvg.id', ':prvgId')
                        ),
                    $qb
                        ->expr()
                        ->andX(
                            $qb->expr()->in('pro.visibility', ':visibility'),
                            $qb
                                ->expr()
                                ->lt('pro.visibility', ProjectVisibilityMode::VISIBILITY_CUSTOM)
                        )
                )
        );

        $qb->setParameter(':prvgId', $viewer->getUserGroupIds());
        $qb->setParameter(
            ':visibility',
            ProjectVisibilityMode::getProjectVisibilityByRoles($viewer)
        );

        return $qb;
    }
}
