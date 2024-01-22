<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Steps\ConsultationStep;

/**
 * @method null|ConsultationStep find($id, $lockMode = null, $lockVersion = null)
 * @method null|ConsultationStep findOneBy(array $criteria, array $orderBy = null)
 * @method ConsultationStep[]    findAll()
 * @method ConsultationStep[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ConsultationStepRepository extends AbstractStepRepository
{
    //fix error where a step is not bind to a project
    public function getAllStepsWithAProject()
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('pas')
            ->leftJoin('cs.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->andWhere('pas.project IS NOT NULL')
        ;

        return $qb->getQuery()->execute();
    }

    public function getByOpinionId(string $opinionId): ?ConsultationStep
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('p', 'pas')
            ->leftJoin('cs.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->leftJoin('cs.consultations', 'csc')
            ->innerJoin('csc.opinions', 'opinions')
            ->andWhere('opinions.id = :opinionId')
            ->setParameter('opinionId', $opinionId)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

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
            ->leftJoin('p.cover', 'pov')
            ->andWhere(':now BETWEEN cs.startAt AND ps.endAt')
            ->setParameter('now', new \DateTime())
            ->groupBy('pas.project')
            ->addOrderBy('ps.endAt', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->execute();
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
            ->leftJoin('p.cover', 'pov')
            ->andWhere(':now < ps.startAt')
            ->setParameter('now', new \DateTime())
            ->groupBy('pas.project')
            ->addOrderBy('ps.startAt', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->execute();
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
            ->leftJoin('p.cover', 'cov')
            ->andWhere(':now > ps.endAt')
            ->setParameter('now', new \DateTime())
            ->groupBy('pas.project')
            ->addOrderBy('ps.startAt', 'ASC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->execute();
    }

    public function findByOrganization(Organization $organization)
    {
        $qb = $this->createQueryBuilder('cs')
            ->join('cs.projectAbstractStep', 'pas')
            ->join('pas.project', 'p')
            ->where('p.organizationOwner = :owner')
            ->setParameter('owner', $organization)
        ;

        return $qb->getQuery()->getResult();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('cs')
            ->andWhere('cs.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true)
        ;
    }
}
