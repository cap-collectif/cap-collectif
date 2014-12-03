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
    public function getLast($limit = 1, $offset = 0)
    {
        $qb = $this->createQueryBuilder('t')
            ->select('t.title, t.slug, count(c.id) as consultationsCount, count(i.id) as ideasCount')
            ->leftJoin('t.Consultations', 'c')
            ->leftJoin('t.Ideas', 'i');

        $this->whereIsEnabled($qb);
        $this->whereIsEnabled($qb, 'c');
        $this->whereIsEnabled($qb, 'i');

        $qb->addOrderBy('t.createdAt', 'DESC')
            ->addGroupBy('t.id');

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        if ($offset) {
            $qb->setFirstResult($offset);
        }

        return $qb
            ->getQuery()
            ->getScalarResult();
    }

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

        $qb->getQuery()
            ->setFirstResult(($page-1) * $nbByPage)
            ->setMaxResults($nbByPage);

        return new Paginator($qb);
    }

    //Helpers
    private function joinEnabledConsultations(QueryBuilder $qb, $alias = 'c')
    {
        $qb->leftJoin('t.Consultations', $alias)
            ->addSelect('c');
        $this->whereIsEnabled($qb, $alias);
        return $qb;
    }
    private function joinEnabledIdeas(QueryBuilder $qb, $alias = 'i')
    {
        $qb->leftJoin('t.Ideas', 'i')
            ->addSelect('i');
        $this->whereIsEnabled($qb, 'i');
        return $qb;
    }

    private function whereIsEnabled(QueryBuilder $qb, $entity = 't')
    {
        $qb->andWhere($entity.'.isEnabled IS NULL OR '.$entity.'.isEnabled = :isEnabled')
            ->setParameter('isEnabled', true);
        return $qb;
    }
}
