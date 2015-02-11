<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * ThemeRepository
 */
class ThemeRepository extends EntityRepository
{
    /**
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function getLast($limit = 1, $offset = 0)
    {
        $qb = $this->getIsEnabledQueryBuilder()
            ->addSelect('c', 'i')
            ->leftJoin('t.Consultations', 'c')
            ->leftJoin('t.Ideas', 'i')
            ->addOrderBy('t.createdAt', 'DESC')
        ;

        $query = $qb->getQuery();

        if ($limit) {
            $query->setMaxResults($limit);
        }

        if ($offset) {
            $query->setFirstResult($offset);
        }

        return new Paginator($query);
    }

    /**
     * @param int $nbByPage
     * @param int $page
     * @param null $term
     * @return Paginator
     */
    public function getSearchResultsWithconsultationsAndIdeas($nbByPage = 8, $page = 1, $term = null)
    {
        if ((int) $page < 1) {
            throw new \InvalidArgumentException(sprintf(
                'The argument "page" cannot be lower than 1 (current value: "%s")',
                $page
            ));
        }

        $qb = $this->getIsEnabledQueryBuilder();
        $qb->addSelect('c, i')
            ->leftJoin('t.Consultations', 'c')
            ->leftJoin('t.Ideas', 'i')
        ;

        $qb->addOrderBy('t.updatedAt', 'DESC');

        if ($term !== null) {
            $qb->andWhere('t.title LIKE :term')
                ->setParameter('term', '%'.$term.'%')
            ;
        }

        $query = $qb->getQuery();

        if($nbByPage > 0){
            $query->setFirstResult(($page - 1) * $nbByPage)
                ->setMaxResults($nbByPage);
        }

        return new Paginator($query);
    }

    protected function getIsEnabledQueryBuilder()
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.isEnabled = :enabled')
            ->setParameter('enabled', true);
    }
}
