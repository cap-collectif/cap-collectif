<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;

class ProjectTypeRepository extends EntityRepository
{
    public function findAll($user = null)
    {
        return $this->createQueryBuilder('p')
            ->select('p')
            ->leftJoin('p.projects', 'projects', Join::WITH, 'projects.projectType IS NOT NULL')
            ->where('projects.visibility >= ' . ProjectVisibilityMode::VISIBILITY_PUBLIC)
            ->groupBy('projects.id')
            ->distinct('p.id')
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 60)
            ->getArrayResult();
    }
}
