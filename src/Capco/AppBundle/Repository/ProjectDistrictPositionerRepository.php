<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class ProjectDistrictPositionerRepository extends EntityRepository
{
    public function findByProjectPositionOrdered(string $projectId)
    {
        return $this->createQueryBuilder('positioner')
            ->where('positioner.project = :project')
            ->setParameter('project', $projectId)
            ->orderBy('positioner.position')
            ->getQuery()
            ->getResult();
    }
}
