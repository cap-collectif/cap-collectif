<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Theme;

/**
 * IdeaRepository.
 */
class IdeaRepository extends EntityRepository
{
    /**
     * Get all trashed ideas.
     *
     * @param int $nbByPage
     * @param int $page
     *
     * @return Paginator
     */
    public function getTrashed($nbByPage = 8, $page = 1)
    {
        if ((int) $page < 1) {
            throw new \InvalidArgumentException(sprintf(
                'The argument "page" cannot be lower than 1 (current value: "%s")',
                $page
            ));
        }

        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.Theme', 't')
            ->andWhere('i.isTrashed = :trashed')
            ->setParameter('trashed', true);

        $query = $qb->getQuery();

        if ($nbByPage > 0) {
            $query->setFirstResult(($page - 1) * $nbByPage)
                ->setMaxResults($nbByPage);
        }

        return new Paginator($query);
    }

    /**
     * Count all trashed ideas.
     *
     * @return mixed
     */
    public function countTrashed()
    {
        return $this->getIsEnabledQueryBuilder()
            ->select('COUNT(i)')
            ->andWhere('i.isTrashed = :trashed')
            ->setParameter('trashed', true)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Count all published (= not trashed AND enabled) ideas.
     *
     * @return mixed
     */
    public function countPublished()
    {
        return $this->getIsEnabledQueryBuilder()
            ->select('COUNT(i)')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Count all ideas by user.
     *
     * @param $user
     *
     * @return mixed
     */
    public function countByUser($user)
    {
        return $this->getIsEnabledQueryBuilder()
            ->select('COUNT(i)')
            ->andWhere('i.Author = :author')
            ->setParameter('author', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Get popular ideas.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return mixed
     */
    public function getPopular($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('i, a, m, t')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.Theme', 't')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->addOrderBy('i.voteCount', 'DESC')
            ->addGroupBy('i.id');

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
     * Get last ideas.
     *
     * @param int $limit
     * @param int $offset
     *
     * @return mixed
     */
    public function getLast($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('i, a, m, t')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.Theme', 't')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->addOrderBy('i.createdAt', 'DESC')
            ->addGroupBy('i.id');

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
     * Get ideas depending on theme and search term, ordered by sort criteria.
     *
     * @param int  $nbByPage
     * @param int  $page
     * @param null $theme
     * @param null $sort
     * @param null $term
     *
     * @return Paginator
     */
    public function getSearchResults($nbByPage = 8, $page = 1, $theme = null, $sort = null, $term = null)
    {
        if ((int) $page < 1) {
            throw new \InvalidArgumentException(sprintf(
                'The argument "page" cannot be lower than 1 (current value: "%s")',
                $page
            ));
        }

        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.Theme', 't')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false);

        if ($theme !== null && $theme !== Theme::FILTER_ALL) {
            $qb->andWhere('t.slug = :theme')
                ->setParameter('theme', $theme)
            ;
        }

        if ($term !== null) {
            $qb->andWhere('i.title LIKE :term')
                ->setParameter('term', '%'.$term.'%')
            ;
        }

        if (isset(Idea::$openingStatuses[$sort]) && Idea::$openingStatuses[$sort] == Idea::SORT_ORDER_VOTES_COUNT) {
            $qb->orderBy('i.voteCount', 'DESC');
        } else {
            $qb->orderBy('i.createdAt', 'DESC');
        }

        $query = $qb->getQuery();

        if ($nbByPage > 0) {
            $query->setFirstResult(($page - 1) * $nbByPage)
                ->setMaxResults($nbByPage);
        }

        return new Paginator($query);
    }

    /**
     * Count search results.
     *
     * @param null $themeSlug
     * @param null $term
     *
     * @return mixed
     */
    public function countSearchResults($themeSlug = null, $term = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(i.id)')
            ->innerJoin('i.Theme', 't')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
        ;

        if ($themeSlug !== null && $themeSlug !== Theme::FILTER_ALL) {
            $qb->andWhere('t.slug = :themeSlug')
                ->setParameter('themeSlug', $themeSlug)
            ;
        }

        if ($term !== null) {
            $qb->andWhere('i.title LIKE :term')
                ->setParameter('term', '%'.$term.'%')
            ;
        }

        return $qb
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * Get ideas by user.
     *
     * @param user
     *
     * @return mixed
     */
    public function getByUser($user)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->andWhere('i.Author = :user')
            ->setParameter('user', $user)
            ->orderBy('i.updatedAt', 'DESC')
        ;

        return $qb
            ->getQuery()
            ->execute();
    }

    /**
     * Get one idea by id.
     *
     * @param $id
     *
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOne($id)
    {
        $query = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't', 'media', 'v', 'c', 'cr')
            ->leftJoin('i.Media', 'media')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.Theme', 't')
            ->leftJoin('i.votes', 'v')
            ->leftJoin('i.comments', 'c', 'WITH', 'c.isEnabled = :enabled AND c.isTrashed = :notTrashed')
            ->leftJoin('c.Reports', 'cr')
            ->setParameter('enabled', true)
            ->setParameter('notTrashed', false)
            ->andWhere('i.id = :id')
            ->setParameter('id', $id)
            ->getQuery();

        return $query->getOneOrNullResult();
    }

    /**
     * Get one idea by id.
     *
     * @param $id
     *
     * @return mixed
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     */
    public function getOneJoinUserReports($slug, $user = null)
    {
        $query = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't', 'media', 'c', 'cr')
            ->leftJoin('i.Media', 'media')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.Theme', 't')
            ->leftJoin('i.comments', 'c', 'WITH', 'c.isEnabled = :enabled AND c.isTrashed = :notTrashed')
            ->leftJoin('c.Reports', 'cr', 'WITH', 'cr.Reporter =  :user')
            ->setParameter('enabled', true)
            ->setParameter('notTrashed', false)
            ->setParameter('user', $user)
            ->setParameter('slug', $slug)
            ->andWhere('i.slug = :slug')
            ->getQuery();

        return $query->getOneOrNullResult();
    }

    /**
     * Get Ideas
     */
    public function getEnabledWith($from = null, $to = null)
    {
        $qb = $this->getIsEnabledQueryBuilder();

        if ($from) {
            $qb->andWhere('i.createdAt >= :from')
               ->setParameter('from', $from);
        }

        if ($to) {
            $qb->andWhere('i.createdAt <= :to')
               ->setParameter('to', $to);
        }

        return $qb->getQuery()->getResult();
    }


    /**
     * Get last ideas by theme.
     *
     * @param theme
     * @param $limit
     * @param $offset
     *
     * @return mixed
     */
    public function getLastByTheme($themeId, $limit = null, $offset = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('i, a, m, t')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.Theme', 't')
            ->andWhere('i.isTrashed = :notTrashed')
            ->andWhere('t.id = :theme')
            ->setParameter('notTrashed', false)
            ->setParameter('theme', $themeId)
            ->orderBy('i.updatedAt', 'DESC')
        ;

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb
            ->getQuery()
            ->execute()
        ;
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
