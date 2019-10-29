<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\District\ProjectDistrictPositioner;
use Doctrine\ORM\EntityRepository;

class ProjectDistrictPositionerRepository extends EntityRepository
{
    public function deleteExistingPositionersForProject(string $projectId): void
    {
        $this->createQueryBuilder('projectDistrictPositioner')
            ->delete(ProjectDistrictPositioner::class, 'p')
            ->where('p.project = :project')
            ->setParameter('project', $projectId)
            ->getQuery()
            ->execute();
    }
}
