<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * AbstractStepRepository.
 */
class AbstractStepRepository extends EntityRepository
{
    /**
     * Get steps by consultation.
     *
     * @return array
     */
    public function getByConsultation($slug)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('c', 'cas')
            ->leftJoin('s.consultationAbstractStep', 'cas')
            ->leftJoin('cas.consultation', 'c')
            ->andWhere('c.slug = :consultation')
            ->setParameter('consultation', $slug)
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
