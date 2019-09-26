<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\District\ProjectDistrictPositioner;
use Doctrine\ORM\EntityRepository;

class ProjectDistrictPositionerRepository extends EntityRepository
{
    public function findByProjectPositionOrdered(string $projectId): array
    {
        return $this->createQueryBuilder('positioner')
            ->where('positioner.project = :project')
            ->setParameter('project', $projectId)
            ->orderBy('positioner.position')
            ->getQuery()
            ->getResult();
    }

    public function deleteExistingPositionersForProject(int $projectId): void
    {
        $this->createQueryBuilder('projectDistrictPositioner')
            ->delete(ProjectDistrictPositioner::class, 'p')
            ->where('p.project = :project')
            ->setParameter('project', $projectId)
            ->getQuery()
            ->execute();
    }
}
