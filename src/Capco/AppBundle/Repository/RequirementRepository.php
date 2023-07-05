<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Doctrine\ORM\EntityRepository;

class RequirementRepository extends EntityRepository
{
    public function getByStep(AbstractStep $step): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.step = :step')
            ->addOrderBy('r.position', 'ASC')
            ->setParameter('step', $step)
            ->getQuery()
            ->getResult()
        ;
    }
}
