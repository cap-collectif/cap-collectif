<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * IdeaRepository
 */
class IdeaRepository extends EntityRepository
{
    public function getLast($limit = 1, $offset = 0)
    {
        $qb = $this->createQueryBuilder('i')
            ->select('i, a, m')
            ->leftJoin('i.Author', 'a')
            ->leftJoin('a.Media', 'm')
            ->andWhere('i.isEnabled = :isEnabled')
            ->addOrderBy('i.createdAt', 'DESC')
            ->addGroupBy('i.id')
            ->setParameter('isEnabled', true);

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

    public function getIdeasWithUser($nbByPage, $page)
    {
        if ((int) $page < 1) {
            throw new \InvalidArgumentException('L\'argument $page ne peut être inférieur à 1 (valeur : "'.$page.'").');
        }

        $query = $this->createQueryBuilder('i')
            ->leftJoin('i.Author', 'a')
            ->addSelect('a')
            ->orderBy('i.createdAt', 'DESC')
            ->getQuery();

        $query->setFirstResult(($page-1) * $nbByPage)
            ->setMaxResults($nbByPage);

        return new Paginator($query);
    }

    public function getOneIdeaWithUserAndTheme($id)
    {

        $query = $this->createQueryBuilder('i')
            ->leftJoin('i.Author', 'a')
            ->addSelect('a')
            ->leftJoin('i.Theme', 't')
            ->addSelect('t')
            ->andWhere('i.id = :id')
            ->setParameter('id', $id)
            ->getQuery();

        return $query->getOneOrNullResult();

    }

}
