<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class ProjectTypeRepository extends EntityRepository
{
    public function findAll()
    {
        return $this->createQueryBuilder('p')
            ->select('p')
            ->getQuery()
            ->getArrayResult();
    }
}
