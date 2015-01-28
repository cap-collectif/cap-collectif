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
        $qb = $this->createQueryBuilder('t');
        $qb = $this->whereIsEnabled($qb);
        $qb->addOrderBy('t.createdAt', 'DESC');

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb
            ->getQuery()
            ->getResult();
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

        $qb = $this->createQueryBuilder('t');

        $this->joinEnabledConsultations($qb);
        $this->joinEnabledIdeas($qb);

        $this->whereIsEnabled($qb, 't');

        $qb->addOrderBy('t.createdAt', 'DESC');

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

    /**
     * Helpers
     * @param QueryBuilder $qb
     * @param string $alias
     * @return QueryBuilder
     */
    private function joinEnabledConsultations(QueryBuilder $qb, $alias = 'c')
    {
        $qb->leftJoin('t.Consultations', $alias)
            ->addSelect('c')
            ->orWhere('c.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
        return $qb;
    }

    private function joinEnabledIdeas(QueryBuilder $qb, $alias = 'i')
    {
        $qb->leftJoin('t.Ideas', 'i')
            ->addSelect('i')
            ->orWhere('i.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
        return $qb;
    }

    private function whereIsEnabled(QueryBuilder $qb, $entity = 't')
    {
        $qb->andWhere($entity.'.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
        return $qb;
    }
}
