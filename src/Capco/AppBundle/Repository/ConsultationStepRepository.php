<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * ConsultationStepRepository.
 */
class ConsultationStepRepository extends EntityRepository
{
    /**
     * Get last open project steps.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return array
     */
    public function getLastOpen($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('p', 'pas', 't', 'pov')
            ->leftJoin('ps.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->leftJoin('p.themes', 't')
            ->leftJoin('p.Cover', 'pov')
            ->andWhere(':now BETWEEN cs.startAt AND ps.endAt')
            ->andWhere('p.isEnabled = :enabled')
            ->setParameter('now', new \DateTime())
            ->setParameter('enabled', true)
            ->groupBy('pas.project')
            ->addOrderBy('ps.endAt', 'DESC');

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
     * Get last future project steps.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return array
     */
    public function getLastFuture($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('p', 'pas', 't', 'pov')
            ->leftJoin('ps.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->leftJoin('p.themes', 't')
            ->leftJoin('p.Cover', 'pov')
            ->andWhere(':now < ps.startAt')
            ->andWhere('p.isEnabled = :enabled')
            ->setParameter('now', new \DateTime())
            ->setParameter('enabled', true)
            ->groupBy('pas.project')
            ->addOrderBy('ps.startAt', 'DESC');

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
     * Get last closed project steps.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return array
     */
    public function getLastClosed($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('p', 'pas', 't', 'pov')
            ->leftJoin('ps.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->leftJoin('p.themes', 't')
            ->leftJoin('p.Cover', 'cov')
            ->andWhere(':now > ps.endAt')
            ->andWhere('p.isEnabled = :enabled')
            ->setParameter('now', new \DateTime())
            ->setParameter('enabled', true)
            ->groupBy('pas.project')
            ->addOrderBy('ps.startAt', 'ASC');

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
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return mixed
     */
    public function getOne($slug)
    {
        $qb = $this->getIsEnabledQueryBuilder()
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
