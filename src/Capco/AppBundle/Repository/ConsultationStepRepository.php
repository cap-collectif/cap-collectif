<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\Query\ResultSetMapping;

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
     * @throws NonUniqueResultException
     * @throws NoResultException
     */
    public function hasRecentContributionsOrUpdatedUsers(string $consultationStepId, \DateTimeInterface $mostRecentFileModificationDate): bool
    {
        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('hasRecentContributionsOrUpdatedUsers', 'hasRecentContributionsOrUpdatedUsers', 'boolean');

        $sql = '
            SELECT
                CASE
                    WHEN COUNT(op.id) > 0 OR COUNT(arg.id) > 0 OR COUNT(v.id) > 0 OR COUNT(r.id) > 0 OR COUNT(s.id) > 0 OR COUNT(u.id) > 0 THEN TRUE
                    ELSE FALSE
                END AS hasRecentContributionsOrUpdatedUsers
            FROM
                opinion op
            LEFT JOIN
                argument arg ON op.id = arg.opinion_id
            LEFT JOIN
                votes v ON op.id = v.opinion_id
            LEFT JOIN
                reporting r ON op.id = r.opinion_id
            LEFT JOIN
                source s ON op.id = s.opinion_id
            LEFT JOIN
                fos_user u ON op.author_id = u.id
            LEFT JOIN
                consultation c ON op.consultation_id = c.id
            WHERE
                c.step_id = :consultationStepId
                AND (
                    op.updated_at > :mostRecentFileModificationDate OR
                    arg.updated_at > :mostRecentFileModificationDate OR
                    v.updated_at > :mostRecentFileModificationDate OR
                    s.updated_at > :mostRecentFileModificationDate OR
                    u.updated_at > :mostRecentFileModificationDate
                )
    ';

        $query = $this->getEntityManager()->createNativeQuery($sql, $rsm);
        $query->setParameter('consultationStepId', $consultationStepId);
        $query->setParameter('mostRecentFileModificationDate', $mostRecentFileModificationDate->format('Y-m-d H:i:s'));

        if ($query->getSingleScalarResult() > 0) {
            return true;
        }

        return false;
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
