<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * AbstractStepRepository.
 */
class AbstractStepRepository extends EntityRepository
{
    /**
     * Get steps by project.
     *
     * @return array
     */
    public function getByProject($slug)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('c', 'cas')
            ->leftJoin('s.projectAbstractStep', 'cas')
            ->leftJoin('cas.project', 'c')
            ->andWhere('c.slug = :project')
            ->setParameter('project', $slug)
            ->addOrderBy('cas.position', 'DESC')
        ;

        return $qb
            ->getQuery()
            ->execute();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
