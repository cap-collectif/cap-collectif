<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectTab;
use Capco\AppBundle\Entity\ProjectTabPresentation;
use Doctrine\ORM\EntityRepository;

class ProjectTabRepository extends EntityRepository
{
    public function isSlugUsedInProject(Project $project, string $slug, ?ProjectTab $excludedTab = null): bool
    {
        $qb = $this->createQueryBuilder('projectTab')
            ->select('COUNT(projectTab.id)')
            ->andWhere('projectTab.project = :project')
            ->andWhere('projectTab.slug = :slug')
            ->setParameter('project', $project)
            ->setParameter('slug', $slug)
        ;

        if (null !== $excludedTab) {
            $qb
                ->andWhere('projectTab.id != :excludedTabId')
                ->setParameter('excludedTabId', $excludedTab->getId())
            ;
        }

        return (int) $qb->getQuery()->getSingleScalarResult() > 0;
    }

    public function hasPresentationTab(Project $project, ?ProjectTab $excludedTab = null): bool
    {
        $qb = $this->createQueryBuilder('projectTab');
        $qb
            ->select('COUNT(projectTab.id)')
            ->andWhere('projectTab.project = :project')
            ->andWhere('projectTab INSTANCE OF :type')
            ->setParameter('project', $project)
            ->setParameter('type', $this->_em->getClassMetadata(ProjectTabPresentation::class))
        ;

        if (null !== $excludedTab) {
            $qb
                ->andWhere('projectTab.id != :excludedTabId')
                ->setParameter('excludedTabId', $excludedTab->getId())
            ;
        }

        return (int) $qb->getQuery()->getSingleScalarResult() > 0;
    }
}
