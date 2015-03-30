<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Theme;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

/**
 * EventRepository.
 */
class EventRepository extends EntityRepository
{
    /**
     * Get events depending on theme, consultation and search term, ordered by startAt criteria.
     *
     * @param null $themeSlug
     * @param null $consultationSlug
     * @param null $term
     *
     * @return array
     */
    public function getSearchResults($themeSlug = null, $consultationSlug = null, $term = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't', 'c')
            ->leftJoin('e.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('e.themes', 't')
            ->leftJoin('e.consultations', 'c')
            ->orderBy('e.startAt', 'ASC')
        ;

        $qb = $this->whereIsNotArchived($qb);

        if ($themeSlug !== null && $themeSlug !== Theme::FILTER_ALL) {
            $qb->andWhere('t.slug = :theme')
                ->setParameter('theme', $themeSlug)
            ;
        }

        if ($consultationSlug !== null && $consultationSlug !== Consultation::FILTER_ALL) {
            $qb->andWhere('c.slug = :consultation')
                ->setParameter('consultation', $consultationSlug)
            ;
        }

        if ($term !== null) {
            $qb->andWhere('e.title LIKE :term')
                ->setParameter('term', '%'.$term.'%')
            ;
        }

        return $query = $qb->getQuery()->getResult();
    }

    /**
     * Get events archived depending on theme and search term, ordered by sort criteria.
     *
     * @param null $themeSlug
     * @param null $consultationSlug
     * @param null $term
     *
     * @return array
     */
    public function getSearchResultsArchived($themeSlug = null, $consultationSlug = null, $term = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't', 'c')
            ->leftJoin('e.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('e.themes', 't', 'WITH', 't.isEnabled = :enabled')
            ->leftJoin('e.consultations', 'c', 'WITH', 'c.isEnabled = :enabled')
            ->setParameter('enabled', true)
            ->orderBy('e.startAt', 'DESC')
        ;

        $qb = $this->whereIsArchived($qb);

        if ($themeSlug !== null && $themeSlug !== Theme::FILTER_ALL) {
            $qb->andWhere('t.slug = :theme')
                ->setParameter('theme', $themeSlug)
            ;
        }

        if ($consultationSlug !== null && $consultationSlug !== Consultation::FILTER_ALL) {
            $qb->andWhere('c.slug = :consultation')
                ->setParameter('consultation', $consultationSlug)
            ;
        }

        if ($term !== null) {
            $qb->andWhere('e.title LIKE :term')
                ->setParameter('term', '%'.$term.'%')
            ;
        }

        return $query = $qb->getQuery()->getResult();
    }

    /**
     * Get one event by slug.
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
            ->addSelect('a', 't', 'media', 'registration', 'c')
            ->leftJoin('e.Author', 'a')
            ->leftJoin('e.Media', 'media')
            ->leftJoin('e.themes', 't', 'WITH', 't.isEnabled = :tEnabled')
            ->leftJoin('e.consultations', 'c', 'WITH', 'c.isEnabled = :cEnabled')
            ->leftJoin('e.registrations', 'registration', 'WITH', 'registration.confirmed = true')
            ->andWhere('e.slug = :slug')
            ->setParameter('tEnabled', true)
            ->setParameter('cEnabled', true)
            ->setParameter('slug', $slug)
            ->orderBy('e.startAt', 'ASC')
            ->addOrderBy('registration.updatedAt', 'DESC')
        ;

        return $query = $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * Get last events future.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return mixed
     */
    public function getLast($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 't', 'media', 'c')
            ->leftJoin('e.Author', 'a')
            ->leftJoin('e.themes', 't')
            ->leftJoin('e.consultations', 'c')
            ->leftJoin('e.Media', 'media')
            ->orderBy('e.startAt', 'ASC');

        $qb = $this->whereIsFuture($qb);

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->execute();
    }

    /**
     * Get last events by consultation.
     *
     * @param $consultationSlug
     * @param int $limit
     * @param int $offset
     *
     * @return mixed
     */
    public function getLastByConsultation($consultationSlug, $limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 't', 'media', 'c')
            ->leftJoin('e.Author', 'a')
            ->leftJoin('e.themes', 't')
            ->leftJoin('e.consultations', 'c')
            ->leftJoin('e.Media', 'media')
            ->andWhere('c.slug = :consultation')
            ->setParameter('consultation', $consultationSlug)
            ->orderBy('e.startAt', 'ASC');

        $qb = $this->whereIsNotArchived($qb);

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->execute();
    }

    /**
     * Get Events by theme.
     *
     * @param theme
     *
     * @return mixed
     */
    public function getByTheme($theme)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'media', 't', 'c')
            ->leftJoin('e.themes', 't')
            ->leftJoin('e.consultations', 'c')
            ->leftJoin('e.Author', 'a')
            ->leftJoin('e.Media', 'media')
            ->andWhere('t.id = :theme')
            ->setParameter('theme', $theme)
            ->orderBy('e.startAt', 'ASC');

        return $qb
            ->getQuery()
            ->execute();
    }

    /**
     * Get Events by consultation.
     *
     * @param consultation
     *
     * @return mixed
     */
    public function getByConsultation($consultation)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'media', 't', 'c')
            ->leftJoin('e.themes', 't')
            ->leftJoin('e.consultations', 'c')
            ->leftJoin('e.Author', 'a')
            ->leftJoin('e.Media', 'media')
            ->andWhere('c.id = :consultation')
            ->setParameter('consultation', $consultation)
            ->orderBy('e.startAt', 'ASC');

        return $qb
            ->getQuery()
            ->execute();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }

    protected function whereIsNotArchived(QueryBuilder $qb, $alias = 'e')
    {
        return $qb->andWhere(':now < '.$alias.'.endAt')
            ->setParameter('now', new \DateTime());
    }

    protected function whereIsFuture(QueryBuilder $qb, $alias = 'e')
    {
        return $qb->andWhere(':now < '.$alias.'.startAt')
            ->setParameter('now', new \DateTime());
    }

    protected function whereIsArchived(QueryBuilder $qb, $alias = 'e')
    {
        return $qb->andWhere(':now > '.$alias.'.endAt')
            ->setParameter('now', new \DateTime());
    }
}
