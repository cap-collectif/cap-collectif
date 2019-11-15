<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class PageRepository extends EntityRepository
{
    public function getAll()
    {
        $qb = $this->createQueryBuilder('p')->orderBy('p.createdAt', 'ASC');

        return $qb->getQuery()->getResult();
    }
}
