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
     * @param $slug
     *
     * @return array
     */
    public function getByProjectSlug(string $slug)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('p', 'pas')
            ->leftJoin('s.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->andWhere('p.slug = :project')
            ->setParameter('project', $slug)
            ->addOrderBy('pas.position', 'DESC')
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
