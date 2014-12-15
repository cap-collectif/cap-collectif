<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Menu;

/**
 * MenuItemRepository
 */
class MenuItemRepository extends EntityRepository
{
    public function getEnabled(Menu $menu)
    {
        $qb = $this->createQueryBuilder('i')
            ->select('i.title, i.link')
            ->leftJoin('i.Page', 'p')
            ->andWhere('i.Menu = :menu')
            ->andWhere('(p.id IS NULL AND i.isEnabled = :isEnabled) OR (p.id IS NOT NULL AND p.isEnabled = :isEnabled)')
            ->addOrderBy('i.position', 'ASC')
            ->setParameter('isEnabled', true)
            ->setParameter('menu', $menu);

        return $qb
            ->getQuery()
            ->getScalarResult();
    }
}
