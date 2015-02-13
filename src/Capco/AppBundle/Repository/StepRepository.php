<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Step;

/**
 * StepRepository
 */
class StepRepository extends EntityRepository
{
    /**
     * Get last open consultations
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function getLastOpen($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('c', 't', 'cov')
            ->leftJoin('s.consultation', 'c')
            ->leftJoin('c.Themes', 't')
            ->leftJoin('c.Cover', 'cov')
            ->andWhere('s.type = :typeConsultation')
            ->andWhere(':now BETWEEN s.startAt AND s.endAt')
            ->andWhere('c.isEnabled = :enabled')
            ->setParameter('typeConsultation', Step::$stepTypes['consultation'])
            ->setParameter('now', new \DateTime())
            ->setParameter('enabled', true)
            ->groupBy('s.consultation')
            ->addOrderBy('s.endAt', 'DESC');

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb
            ->getQuery()
            ->execute();
    }

    /**
     * Get last future consultations
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function getLastFuture($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('c', 't', 'cov')
            ->leftJoin('s.consultation', 'c')
            ->leftJoin('c.Themes', 't')
            ->leftJoin('c.Cover', 'cov')
            ->andWhere('s.type = :typeConsultation')
            ->andWhere(':now < s.startAt')
            ->andWhere('c.isEnabled = :enabled')
            ->setParameter('typeConsultation', Step::$stepTypes['consultation'])
            ->setParameter('now', new \DateTime())
            ->setParameter('enabled', true)
            ->groupBy('s.consultation')
            ->addOrderBy('s.startAt', 'DESC');

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb
            ->getQuery()
            ->execute();
    }

    /**
     * Get last closed consultations
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function getLastClosed($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('c', 't', 'cov')
            ->leftJoin('s.consultation', 'c')
            ->leftJoin('c.Themes', 't')
            ->leftJoin('c.Cover', 'cov')
            ->andWhere('s.type = :typeConsultation')
            ->andWhere(':now > s.endAt')
            ->andWhere('c.isEnabled = :enabled')
            ->setParameter('typeConsultation', Step::$stepTypes['consultation'])
            ->setParameter('now', new \DateTime())
            ->setParameter('enabled', true)
            ->groupBy('s.consultation')
            ->addOrderBy('s.startAt', 'ASC');

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

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
