<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;

class ProjectTypeRepository extends EntityRepository
{
    public function findAll()
    {
        return $this->createQueryBuilder('p')
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 60)
            ->getArrayResult();
    }
}
