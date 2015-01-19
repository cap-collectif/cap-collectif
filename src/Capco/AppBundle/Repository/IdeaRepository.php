<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Theme;

/**
 * IdeaRepository
 */
class IdeaRepository extends EntityRepository
{
    /**
     * Get all trashed ideas
     * @return mixed
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
            ->andWhere('i.isTrashed = :trashed')
            ->setParameter('trashed', true)
            ->leftJoin('i.Author', 'a')
            ->addSelect('a')
            ->leftJoin('a.Media', 'm')
            ->addSelect('m')
            ->leftJoin('i.Theme', 't')
            ->addSelect('t')
        ;

        $query = $qb->getQuery();

        if($nbByPage > 0){
            $query->setFirstResult(($page - 1) * $nbByPage)
                ->setMaxResults($nbByPage);
        }

        return new Paginator($query);
    }

    /**
     * Count all trashed ideas
     * @return mixed
     */
    public function countTrashed(){

        return $this->getIsEnabledQueryBuilder()
            ->select('COUNT(i)')
            ->andWhere('i.isTrashed = :trashed')
            ->setParameter('trashed', true)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Count all published (= not trashed) ideas
     * @return mixed
     */
    public function countPublished(){

        return $this->getIsEnabledQueryBuilder()
            ->select('COUNT(i)')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Count all ideas by user
     * @param $user
     * @return mixed
     */
    public function countByUser($user){

        return $this->getIsEnabledQueryBuilder()
            ->select('COUNT(i)')
            ->andWhere('i.Author = :author')
            ->setParameter('author', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Get last ideas
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
     * Get ideas depending on theme and search term, ordered by sort criteria
     * @return mixed
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
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->leftJoin('i.Author', 'a')
            ->addSelect('a')
            ->leftJoin('a.Media', 'm')
            ->addSelect('m')
            ->leftJoin('i.Theme', 't')
            ->addSelect('t')
        ;

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

        if($nbByPage > 0){
            $query->setFirstResult(($page - 1) * $nbByPage)
                ->setMaxResults($nbByPage);
        }

        return new Paginator($query);
    }

    /**
     * Get ideas by user
     * @param user
     * @return mixed
     */
    public function getByUser($user)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->leftJoin('i.Author', 'a')
            ->addSelect('a')
            ->leftJoin('a.Media', 'm')
            ->addSelect('m')
            ->andWhere('i.Author = :user')
            ->setParameter('user', $user)
            ->orderBy('i.createdAt', 'DESC');

        return $qb
            ->getQuery()
            ->execute();
    }

    /**
     * Get one idea by id
     * @return mixed
     */
    public function getOne($id)
    {
        $query = $this->getIsEnabledQueryBuilder()
            ->leftJoin('i.Author', 'a')
            ->addSelect('a')
            ->leftJoin('a.Media', 'm')
            ->addSelect('m')
            ->leftJoin('i.Theme', 't')
            ->addSelect('t')
            ->andWhere('i.id = :id')
            ->setParameter('id', $id)
            ->getQuery();

        return $query->getOneOrNullResult();
    }

    /**
     * Get ideas by theme
     * @param theme
     * @return mixed
     */
    public function getByTheme($theme)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('i, a, m, t')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.Theme', 't')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->andWhere('t.id = :theme')
            ->setParameter('theme', $theme)
            ->orderBy('i.createdAt', 'DESC');

        return $qb
            ->getQuery()
            ->execute();
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }
}
