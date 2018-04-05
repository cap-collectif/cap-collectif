<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Theme;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * IdeaRepository.
 */
class IdeaRepository extends EntityRepository
{
    public function getRecentOrdered()
    {
        $qb = $this->createQueryBuilder('i')
            ->select('i.id', 'i.title', 'i.createdAt', 'i.updatedAt', 'a.username as author', 'i.isEnabled as published', 'i.isTrashed as trashed')
            ->where('i.validated = :validated')
            ->leftJoin('i.Author', 'a')
            ->setParameter('validated', false)
        ;

        return $qb->getQuery()
            ->getArrayResult()
        ;
    }

    public function getArrayById($id)
    {
        $qb = $this->createQueryBuilder('i')
            ->select('i.id', 'i.title', 'i.createdAt', 'i.updatedAt', 'a.username as author', 'i.isEnabled as published', 'i.isTrashed as trashed', 'CONCAT(CONCAT(i.object, \'<hr>\'), i.body) as body')
            ->leftJoin('i.Author', 'a')
            ->where('i.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb->getQuery()
            ->getOneOrNullResult(Query::HYDRATE_ARRAY)
        ;
    }

    /**
     * Get all trashed ideas.
     *
     * @param mixed $nbByPage
     * @param mixed $page
     */
    public function getTrashed($nbByPage = 8, $page = 1)
    {
        if ($page < 1) {
            throw new \InvalidArgumentException(sprintf(
                'The argument "page" cannot be lower than 1 (current value: "%s")',
                $page
            ));
        }

        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.theme', 't')
            ->andWhere('i.isTrashed = :trashed')
            ->setParameter('trashed', true);

        $query = $qb->getQuery();

        if ($nbByPage > 0) {
            $query->setFirstResult(($page - 1) * $nbByPage)
                ->setMaxResults($nbByPage);
        }

        $result = new Paginator($query);
        $ideas = [];
        foreach ($result as $idea) {
            $ideas[] = $idea;
        }

        return $ideas;
    }

    /**
     * Count all trashed ideas.
     *
     * @return mixed
     */
    public function countTrashed()
    {
        $qb = $this->getIsEnabledQueryBuilder()
          ->select('COUNT(i)')
          ->andWhere('i.isTrashed = :trashed')
          ->setParameter('trashed', true)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Count all published (= not trashed AND enabled) ideas.
     *
     * @return mixed
     */
    public function countPublished()
    {
        $qb = $this->getIsEnabledQueryBuilder()
          ->select('COUNT(i)')
          ->andWhere('i.isTrashed = :notTrashed')
          ->setParameter('notTrashed', false)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
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
        $qb = $this->getIsEnabledQueryBuilder()
          ->select('COUNT(i)')
          ->andWhere('i.Author = :author')
          ->setParameter('author', $user)
        ;

        return (int) $qb->getQuery()->getSingleScalarResult();
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
            ->leftJoin('i.theme', 't')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->addOrderBy('i.votesCount', 'DESC')
            ->addGroupBy('i.id');

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        $result = new Paginator($qb);

        $ideas = [];
        foreach ($result as $idea) {
            $ideas[] = $idea;
        }

        return $ideas;
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
            ->leftJoin('i.theme', 't')
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

        $result = new Paginator($qb);

        $ideas = [];
        foreach ($result as $idea) {
            $ideas[] = $idea;
        }

        return $ideas;
    }

    /**
     * Get ideas depending on theme and search term, ordered by sort criteria.
     *
     * @param int    $pagination
     * @param int    $page
     * @param int    $from
     * @param int    $to
     * @param string $themeId
     * @param string $sort
     * @param string $term
     *
     * @return array
     */
    public function getSearchResults($pagination = null, $page = 1, $from = null, $to = null, $themeId = null, $sort = 'last', $term = null)
    {
        if ($page < 1) {
            throw new \InvalidArgumentException(sprintf(
                'The argument "page" cannot be lower than 1 (current value: "%s")',
                $page
            ));
        }

        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.theme', 't')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false);

        if ($themeId !== null) {
            $qb->andWhere('t.id = :themeId')
                ->setParameter('themeId', $themeId)
            ;
        }

        if ($term !== null) {
            $qb->andWhere('i.title LIKE :term')
                ->setParameter('term', '%' . $term . '%')
            ;
        }

        if ($from) {
            $qb->andWhere('i.createdAt >= :from')
                ->setParameter('from', $from);
        }

        if ($to) {
            $qb->andWhere('i.createdAt <= :to')
                ->setParameter('to', $to);
        }

        if ($sort === 'last') {
            $qb->orderBy('i.createdAt', 'DESC');
            $qb->addOrderBy('i.votesCount', 'DESC');
        } elseif ($sort === 'old') {
            $qb->orderBy('i.createdAt', 'ASC');
            $qb->addOrderBy('i.votesCount', 'DESC');
        } elseif ($sort === 'popular') {
            $qb->orderBy('i.votesCount', 'DESC');
            $qb->addOrderBy('i.updatedAt', 'DESC');
        } elseif ($sort === 'comments') {
            $qb->orderBy('i.commentsCount', 'DESC');
            $qb->addOrderBy('i.updatedAt', 'DESC');
        }

        $query = $qb->getQuery();

        if ($pagination > 0) {
            $query->setFirstResult(($page - 1) * $pagination)
                ->setMaxResults($pagination);
        }

        $results = new Paginator($query);
        $ideas = [];
        foreach ($results as $idea) {
            $ideas[] = $idea;
        }

        return $ideas;
    }

    /**
     * Count search results.
     *
     * @param string $from
     * @param string $to
     * @param null   $themeId
     * @param null   $term
     *
     * @return mixed
     */
    public function countSearchResults($from = null, $to = null, $themeId = null, $term = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('COUNT(i.id)')
            ->innerJoin('i.theme', 't')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
        ;

        if ($themeId !== null) {
            $qb->andWhere('t.id = :themeId')
                ->setParameter('themeId', $themeId)
            ;
        }

        if ($term !== null) {
            $qb->andWhere('i.title LIKE :term')
                ->setParameter('term', '%' . $term . '%')
            ;
        }

        if ($from) {
            $qb->andWhere('i.createdAt >= :from')
                ->setParameter('from', $from);
        }

        if ($to) {
            $qb->andWhere('i.createdAt <= :to')
                ->setParameter('to', $to);
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Get ideas by user.
     *
     * @param user
     * @param mixed $user
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
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return mixed
     */
    public function getOne($id)
    {
        $query = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't', 'media', 'v', 'c', 'cr')
            ->leftJoin('i.media', 'media')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.theme', 't')
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
     * @param mixed      $slug
     * @param null|mixed $user
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return mixed
     */
    public function getOneJoinUserReports($slug, $user = null)
    {
        $query = $this->getIsEnabledQueryBuilder()
            ->addSelect('a', 'm', 't', 'media', 'c', 'cr')
            ->leftJoin('i.media', 'media')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.theme', 't')
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
     * Get last ideas by theme.
     *
     * @param theme
     * @param $limit
     * @param $offset
     * @param mixed $themeId
     *
     * @return mixed
     */
    public function getLastByTheme($themeId, $limit = null, $offset = null)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('i, a, m, t')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.theme', 't')
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

        $result = new Paginator($qb);

        $ideas = [];
        foreach ($result as $idea) {
            $ideas[] = $idea;
        }

        return $ideas;
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.isEnabled = true')
            ->andWhere('i.expired = false')
        ;
    }
}
