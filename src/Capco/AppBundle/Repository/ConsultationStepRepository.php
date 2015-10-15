<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * ConsultationStepRepository.
 */
class ConsultationStepRepository extends EntityRepository
{
    /**
     * Get last open consultation steps.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return array
     */
    public function getLastOpen($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('c', 'cas', 't', 'cov')
            ->leftJoin('cs.consultationAbstractStep', 'cas')
            ->leftJoin('cas.consultation', 'c')
            ->leftJoin('c.Themes', 't')
            ->leftJoin('c.Cover', 'cov')
            ->andWhere(':now BETWEEN cs.startAt AND cs.endAt')
            ->andWhere('c.isEnabled = :enabled')
            ->setParameter('now', new \DateTime())
            ->setParameter('enabled', true)
            ->groupBy('cas.consultation')
            ->addOrderBy('cs.endAt', 'DESC');

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
     * Get last future consultation steps.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return array
     */
    public function getLastFuture($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('c', 'cas', 't', 'cov')
            ->leftJoin('cs.consultationAbstractStep', 'cas')
            ->leftJoin('cas.consultation', 'c')
            ->leftJoin('c.Themes', 't')
            ->leftJoin('c.Cover', 'cov')
            ->andWhere(':now < cs.startAt')
            ->andWhere('c.isEnabled = :enabled')
            ->setParameter('now', new \DateTime())
            ->setParameter('enabled', true)
            ->groupBy('cas.consultation')
            ->addOrderBy('cs.startAt', 'DESC');

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
     * Get last closed consultation steps.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return array
     */
    public function getLastClosed($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('c', 'cas', 't', 'cov')
            ->leftJoin('cs.consultationAbstractStep', 'cas')
            ->leftJoin('cas.consultation', 'c')
            ->leftJoin('c.Themes', 't')
            ->leftJoin('c.Cover', 'cov')
            ->andWhere(':now > cs.endAt')
            ->andWhere('c.isEnabled = :enabled')
            ->setParameter('now', new \DateTime())
            ->setParameter('enabled', true)
            ->groupBy('cas.consultation')
            ->addOrderBy('cs.startAt', 'ASC');

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
     * Get one by slug.
     *
     * @param $slug
     *
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOne($slug)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('t')
            ->andWhere('cs.slug = :slug')
            ->setParameter('slug', $slug)
        ;

        return $qb
            ->getQuery()
            ->getOneOrNullResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('cs')
            ->andWhere('cs.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
