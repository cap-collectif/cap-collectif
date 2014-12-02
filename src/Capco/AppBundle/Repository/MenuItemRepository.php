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
            ->andWhere('i.isEnabled = :isEnabled')
            ->andWhere('i.Menu = :menu')
            ->addOrderBy('i.position', 'ASC')
            ->setParameter('isEnabled', true)
            ->setParameter('menu', $menu);

        return $qb
            ->getQuery()
            ->getScalarResult();
    }
}
