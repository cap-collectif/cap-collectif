<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Theme;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\ORM\QueryBuilder;

/**
 * EventRepository
 */
class EventRepository extends EntityRepository
{
    /**
     * Get events depending on theme and search term, ordered by startAt criteria
     * @param null $theme
     * @param null $term
     * @return array
     */
    public function getSearchResults($theme = null, $term = null)
    {

        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't')
            ->leftJoin('e.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('e.Theme', 't')
            ->orderBy('e.startAt', 'ASC')
        ;

        $qb = $this->whereIsNotArchived($qb);

        if ($theme !== null && $theme !== Theme::FILTER_ALL) {
            $qb->andWhere('t.slug = :theme')
                ->setParameter('theme', $theme)
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
     * Get events archived depending on theme and search term, ordered by sort criteria
     * @param null $theme
     * @param null $term
     * @return array
     */
    public function getSearchResultsArchived($theme = null, $term = null)
    {

        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't')
            ->leftJoin('e.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('e.Theme', 't')
            ->orderBy('e.startAt', 'DESC')
        ;

        $qb = $this->whereIsArchived($qb);

        if ($theme !== null && $theme !== Theme::FILTER_ALL) {
            $qb->andWhere('t.slug = :theme')
                ->setParameter('theme', $theme)
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
     * Get one event by slug
     * @param $slug
     * @return mixed
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOne($slug)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a, t, media, registration')
            ->leftJoin('e.Author', 'a')
            ->leftJoin('e.Media', 'media')
            ->leftJoin('e.Theme', 't')
            ->leftJoin('e.registrations', 'registration', 'WITH', 'registration.confirmed = true')
            ->andWhere('e.slug = :slug')
            ->setParameter('slug', $slug)
            ;

        return $query = $qb->getQuery()->getOneOrNullResult();
    }

    /**
     * Get last events future
     * @param int $limit
     * @param int $offset
     * @return mixed
     */
    public function getLast($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a, t, media')
            ->leftJoin('e.Author', 'a')
            ->leftJoin('e.Theme', 't')
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
     * Get Events by theme
     * @param theme
     * @return mixed
     */
    public function getByTheme($theme)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a, media, t')
            ->leftJoin('e.Theme', 't')
            ->leftJoin('e.Author', 'a')
            ->leftJoin('e.Media', 'media')
            ->andWhere('t.id = :theme')
            ->setParameter('theme', $theme)
            ->orderBy('e.createdAt', 'DESC');

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

    protected function whereIsNotArchived (QueryBuilder $qb, $alias='e')
    {
        return $qb->andWhere(':now < '.$alias.'.endAt')
            ->setParameter('now', new \DateTime());
    }

    protected function whereIsFuture (QueryBuilder $qb, $alias='e')
    {
        return $qb->andWhere(':now < '.$alias.'.startAt')
            ->setParameter('now', new \DateTime());
    }

    protected function whereIsArchived (QueryBuilder $qb, $alias='e')
    {
        return $qb->andWhere(':now > '.$alias.'.endAt')
            ->setParameter('now', new \DateTime());
    }
}
