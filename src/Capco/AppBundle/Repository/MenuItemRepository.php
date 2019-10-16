<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\MenuItem;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

/**
 * MenuItemRepository.
 *
 * @method MenuItem findOneByLink(string $link)
 */
class MenuItemRepository extends EntityRepository
{
    public function getParentItems($menu, string $env = null)
    {
        $qb = $this->createQueryBuilder('i')
            ->addSelect('page')
            ->andWhere('i.parent IS NULL')
            ->andWhere('i.menu = :menu')
            ->setParameter('menu', $menu)
            ->addOrderBy('i.position', 'ASC');

        $qb = $this->whereIsEnabled($qb);

        if ('dev' !== $env || 'test' !== $env) {
            return $qb
                ->getQuery()
                ->useQueryCache(true)
                ->useResultCache(true, 60)
                ->getResult();
        }

        return $qb->getQuery()->getResult();
    }

    public function getChildItems($menu)
    {
        $qb = $this->createQueryBuilder('i')
            ->addSelect('parent', 'page')
            ->leftJoin('i.parent', 'parent')
            ->andWhere('i.parent IS NOT NULL')
            ->andWhere('i.menu = :menu')
            ->setParameter('menu', $menu)
            ->addOrderBy('i.position', 'ASC');

        $qb = $this->whereIsEnabled($qb);

        return $qb->getQuery()->getResult();
    }

    private function whereIsEnabled(QueryBuilder $qb)
    {
        $qb
            ->leftJoin('i.Page', 'page')
            ->andWhere(
                'i.isEnabled = :isEnabled AND (page.id IS NULL OR (page.id IS NOT NULL AND page.isEnabled = :isEnabled))'
            )
            ->setParameter('isEnabled', true);

        return $qb;
    }
}
