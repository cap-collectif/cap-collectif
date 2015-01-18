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
    public function findByTerm($term)
    {
        return $this->getIsEnabledQueryBuilder()
            ->andWhere('i.title LIKE :term')
            ->setParameter('term', '%'. $term .'%')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->getQuery()
            ->getResult();
    }

    public function getIdeasWithUser($nbByPage, $page)
    {
        if ((int) $page < 1) {
            throw new \InvalidArgumentException('L\'argument $page ne peut être inférieur à 1 (valeur : "'.$page.'").');
        }

        $query = $this->getIsEnabledQueryBuilder()
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->leftJoin('i.Author', 'a')
            ->addSelect('a')
            ->leftJoin('a.Media', 'm')
            ->addSelect('m')
            ->orderBy('i.createdAt', 'DESC')
            ->getQuery();

        $query->setFirstResult(($page-1) * $nbByPage)
            ->setMaxResults($nbByPage);

        return new Paginator($query);
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
    }

    /**
     * Count all ideas trashed
     * @return mixed
     */
    public function getTrashedIdeasNb(){

        return $this->createQueryBuilder('i')
            ->select('COUNT(i)')
            ->andWhere('i.isEnabled = :enabled')
            ->andWhere('i.isTrashed = :trashed')
            ->setParameter('trashed', true)
            ->setParameter('enabled', true)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Count all ideas notTrashed and Enabled
     * @param $user
     * @return mixed
     */
    public function countIdeasEnabledAndNotTrashedByUser($user){

        return $this->createQueryBuilder('i')
            ->select('COUNT(i)')
            ->andWhere('i.isEnabled = :enabled')
            ->andWhere('i.isTrashed = :trashed')
            ->setParameter('trashed', false)
            ->setParameter('enabled', true)
            ->andWhere('i.Author = :author')
            ->setParameter('author', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getPublishedIdeasNb(){

        return $this->createQueryBuilder('i')
            ->select('COUNT(i)')
            ->andWhere('i.isEnabled = :enabled')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->setParameter('enabled', true)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getLast($limit = 1, $offset = 0)
    {
        $qb = $this->createQueryBuilder('i')
            ->select('i, a, m')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->andWhere('i.isEnabled = :isEnabled')
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('isEnabled', true)
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

    public function findByTheme($theme)
    {
        $qb = $this->createQueryBuilder('i')
            ->select('i, a, m, t')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->leftJoin('i.Theme', 't')
            ->andWhere('i.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true)
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->andWhere('t.id = :theme')
            ->setParameter('theme', $theme)
            ->orderBy('i.createdAt', 'DESC');
            
        return $qb
            ->getQuery()
            ->execute();
    }

    public function getOneIdeaWithUserAndTheme($id)
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

    public function getSearchResultsWithUser($nbByPage = 8, $page = 1, $theme = null, $sort = null, $term = null)
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
        ;

        if ($theme !== null && $theme !== Theme::FILTER_ALL) {
            $qb->leftJoin('i.Theme', 't')
                ->andWhere('t.slug = :theme')
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
    
    public function getTrashedIdeas($nbByPage = 8, $page = 1)
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
        ;

        $query = $qb->getQuery();

        if($nbByPage > 0){
            $query->setFirstResult(($page - 1) * $nbByPage)
                ->setMaxResults($nbByPage);
        }

        return new Paginator($query);
    }

    public function getUser($user)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->select('i')
            ->leftJoin('i.Author', 'a')
            ->addSelect('a')
            ->leftJoin('a.Media', 'm')
            ->addSelect('m')
            ->andWhere('i.Author = :user')
            ->setParameter('user', $user)
            ->andWhere('i.isTrashed = :notTrashed')
            ->setParameter('notTrashed', false)
            ->orderBy('i.createdAt', 'DESC');

        return $qb
            ->getQuery()
            ->execute();
    }
}
