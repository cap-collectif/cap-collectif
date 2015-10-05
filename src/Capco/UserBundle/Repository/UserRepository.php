<?php

namespace Capco\UserBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Consultation;

/**
 * UserRepository.
 */
class UserRepository extends EntityRepository
{
    public function findConsultationSourceContributorsWithCount(Consultation $consultation)
    {
        $em = $this->getEntityManager();
        $query = $em->createQuery('
          select u.id, count(distinct s) as sources_count
          from CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:Source s WITH s.Author = u
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE s.isEnabled = 1 AND ((s.Opinion IS NOT NULL AND o.isEnabled = 1 AND o.step = :consultation) OR (s.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovo.step = :consultation))
          GROUP BY u.id
        ')
            ->setParameter('consultation', $consultation);

        return $query->getResult();
    }

    public function findConsultationArgumentContributorsWithCount(Consultation $consultation)
    {
        $em = $this->getEntityManager();
        $query = $em->createQuery('
          select u.id, count(distinct a) as arguments_count
          from CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:Argument a WITH a.Author = u
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE a.isEnabled = 1 AND ((a.opinion IS NOT NULL AND o.isEnabled = 1 AND o.step = :consultation) OR (a.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovo.step = :consultation))
          GROUP BY u.id
        ')
        ->setParameter('consultation', $consultation);

        return $query->getResult();
    }

    public function findConsultationOpinionContributorsWithCount(Consultation $consultation)
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct opinions) as opinions_count')
            ->leftJoin('u.opinions', 'opinions', 'WITH', 'opinions.isEnabled = 1')
            ->leftJoin('opinions.step', 'step', 'WITH', 'step.isEnabled = 1')
            ->leftJoin('step.consultationAbstractStep', 'cas')
            ->where('cas.consultation = :consultation')
            ->groupBy('u.id')
            ->setParameter('consultation', $consultation)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findConsultationVersionContributorsWithCount(Consultation $consultation)
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct versions) as versions_count')
            ->leftJoin('u.opinionVersions', 'versions', 'WITH', 'versions.enabled = 1')
            ->leftJoin('versions.parent', 'opinions', 'WITH', 'opinions.isEnabled = 1')
            ->leftJoin('opinions.step', 'step', 'WITH', 'step.isEnabled = 1')
            ->leftJoin('step.consultationAbstractStep', 'cas')
            ->where('cas.consultation = :consultation')
            ->groupBy('u.id')
            ->setParameter('consultation', $consultation)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findConsultationOpinionVotersWithCount(Consultation $consultation)
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct opinions_votes) as opinions_votes_count')
            ->leftJoin('CapcoAppBundle:OpinionVote', 'opinions_votes', 'WITH', 'opinions_votes.user = u AND opinions_votes.confirmed = 1')
            ->leftJoin('opinions_votes.opinion', 'opinions_votes_opinion', 'WITH', 'opinions_votes_opinion.isEnabled = 1')
            ->leftJoin('opinions_votes_opinion.step', 'opinions_votes_opinion_step', 'WITH', 'opinions_votes_opinion_step.isEnabled = 1')
            ->leftJoin('opinions_votes_opinion_step.consultationAbstractStep', 'cas')
            ->where('cas.consultation = :consultation')
            ->groupBy('u.id')
            ->setParameter('consultation', $consultation)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findConsultationVersionVotersWithCount(Consultation $consultation)
    {
        $qb = $this->createQueryBuilder('u')
            ->select('u.id', 'count(distinct versions_votes) as versions_votes_count')
            ->leftJoin('CapcoAppBundle:OpinionVersionVote', 'versions_votes', 'WITH', 'versions_votes.user = u AND versions_votes.confirmed = 1')
            ->leftJoin('versions_votes.opinionVersion', 'versions_votes_version', 'WITH', 'versions_votes_version.enabled = 1')
            ->leftJoin('versions_votes_version.parent', 'versions_votes_version_parent', 'WITH', 'versions_votes_version_parent.isEnabled = 1')
            ->leftJoin('versions_votes_version_parent.step', 'versions_votes_version_step', 'WITH', 'versions_votes_version_step.isEnabled = 1')
            ->leftJoin('versions_votes_version_step.consultationAbstractStep', 'cas')
            ->where('cas.consultation = :consultation')
            ->groupBy('u.id')
            ->setParameter('consultation', $consultation)
        ;

        return $qb->getQuery()->getResult();
    }

    public function findConsultationArgumentVotersWithCount(Consultation $consultation)
    {
        $em = $this->getEntityManager();
        $query = $em->createQuery('
          select u.id, count(distinct av) as arguments_votes_count
          from CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:ArgumentVote av WITH av.user = u
          LEFT JOIN CapcoAppBundle:Argument a WITH av.argument = a
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH a.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH a.opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE av.user = u AND av.confirmed = 1 AND a.isEnabled = 1 AND ((a.opinion IS NOT NULL AND o.isEnabled = 1 AND o.step = :consultation) OR (a.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovo.step = :consultation))
          GROUP BY av.user
        ')
        ->setParameter('consultation', $consultation);

        return $query->getResult();
    }

    public function findConsultationSourceVotersWithCount(Consultation $consultation)
    {
        $em = $this->getEntityManager();
        $query = $em->createQuery('
          select u.id, count(distinct sv) as sources_votes_count
          from CapcoUserBundle:User u
          LEFT JOIN CapcoAppBundle:SourceVote sv WITH sv.user = u
          LEFT JOIN CapcoAppBundle:Source s WITH sv.source = s
          LEFT JOIN CapcoAppBundle:OpinionVersion ov WITH s.opinionVersion = ov
          LEFT JOIN CapcoAppBundle:Opinion o WITH s.Opinion = o
          LEFT JOIN CapcoAppBundle:Opinion ovo WITH ov.parent = ovo
          WHERE sv.user = u AND sv.confirmed = 1 AND s.isEnabled = 1 AND ((s.Opinion IS NOT NULL AND o.isEnabled = 1 AND o.step = :consultation) OR (s.opinionVersion IS NOT NULL AND ov.enabled = 1 AND ovo.isEnabled = 1 AND ovo.step = :consultation))
          GROUP BY sv.user
        ')
            ->setParameter('consultation', $consultation);

        return $query->getResult();
    }

    public function findWithMediaByIds($ids)
    {
        $qb = $this->createQueryBuilder('u');
        $qb->addSelect('m')
            ->leftJoin('u.Media', 'm')
            ->where('u.id IN (:ids)')
            ->setParameter('ids', $ids);

        return $qb->getQuery()->getResult();
    }

    public function getEnabledWith($type = null, $from = null, $to = null)
    {
        $qb = $this->getIsEnabledQueryBuilder();

        if ($type) {
            $qb->andWhere('u.userType = :type')
               ->setParameter('type', $type)
               ;
        }

        if ($from) {
            $qb->andWhere('u.createdAt >= :from')
               ->setParameter('from', $from)
               ;
        }

        if ($to) {
            $qb->andWhere('u.createdAt <= :to')
               ->setParameter('to', $to)
               ;
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Get search results.
     *
     * @param int  $nbByPage
     * @param int  $page
     * @param null $sort
     * @param null $type
     *
     * @return Paginator
     */
    public function getSearchResults($nbByPage = 8, $page = 1, $sort = null, $type = null)
    {
        if ((int) $page < 1) {
            throw new \InvalidArgumentException(sprintf(
                'The argument "page" cannot be lower than 1 (current value: "%s")',
                $page
            ));
        }

        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('m', 'ut')
            ->leftJoin('u.Media', 'm')
            ->leftJoin('u.userType', 'ut')
        ;

        if ($type !== null && $type !== UserType::FILTER_ALL) {
            $qb->andWhere('ut.slug = :type')
                ->setParameter('type', $type)
            ;
        }

        if (isset(User::$sortOrder[$sort]) && User::$sortOrder[$sort] == User::SORT_ORDER_CONTRIBUTIONS_COUNT) {
            $qb = $this->orderByContributionsCount($qb, 'DESC');
        } else {
            $qb->orderBy('u.createdAt', 'DESC');
        }

        if ($nbByPage > 0) {
            $qb->setFirstResult(($page - 1) * $nbByPage)
                ->setMaxResults($nbByPage);
        }

        return new Paginator($qb);
    }

    /**
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.enabled = :enabled')
            ->setParameter('enabled', true);
    }

    public function orderByContributionsCount(QueryBuilder $qb, $order = 'DESC')
    {
        return $qb->addSelect('(u.opinionsCount + u.opinionVersionsCount + u.argumentsCount + u.sourcesCount + u.ideasCount + u.ideaCommentsCount + u.postCommentsCount + u.eventCommentsCount) AS HIDDEN contributionsCount')
            ->orderBy('contributionsCount', $order)
        ;
    }
}
