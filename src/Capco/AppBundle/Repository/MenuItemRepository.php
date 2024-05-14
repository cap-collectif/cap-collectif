<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\MenuItem;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

/**
 * MenuItemRepository.
 */
class MenuItemRepository extends EntityRepository
{
    public function findOneByLink(string $link): ?MenuItem
    {
        $qb = $this->createQueryBuilder('mi')
            ->leftJoin('mi.translations', 'mit')
            ->where('mit.link = :link')
            ->setParameter('link', $link)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getPublishedFooterPages(): array
    {
        $qb = $this->createQueryBuilder('i')
            ->addSelect('page')
            ->andWhere('i.parent IS NULL')
            ->andWhere('i.menu = :menu')
            ->setParameter('menu', MenuItem::TYPE_FOOTER)
            ->addOrderBy('i.position', 'ASC')
        ;
        $qb = $this->whereIsEnabled($qb);

        return $qb->getQuery()->getResult();
    }

    public function getParentItems($menu)
    {
        $qb = $this->createQueryBuilder('i')
            ->addSelect('page')
            ->andWhere('i.parent IS NULL')
            ->andWhere('i.menu = :menu')
            ->setParameter('menu', $menu)
            ->addOrderBy('i.position', 'ASC')
        ;

        $qb = $this->whereIsEnabled($qb);

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->getResult()
        ;
    }

    public function getChildItems($menu)
    {
        $qb = $this->createQueryBuilder('i')
            ->addSelect('parent', 'page')
            ->leftJoin('i.parent', 'parent')
            ->andWhere('i.parent IS NOT NULL')
            ->andWhere('i.menu = :menu')
            ->setParameter('menu', $menu)
            ->addOrderBy('i.position', 'ASC')
        ;

        $qb = $this->whereIsEnabled($qb);

        return $qb->getQuery()->getResult();
    }

    /**
     * @return array<MenuItem>
     */
    public function getChildrenByItem(MenuItem $menuItem): array
    {
        $qb = $this->createQueryBuilder('i')
            ->where('i.parent = :menuItem')
            ->andWhere('i.menu = 1')
            ->setParameter('menuItem', $menuItem)
        ;

        $qb = $this->whereIsEnabled($qb);

        return $qb->getQuery()->getResult();
    }

    /**
     * @return array<MenuItem>
     */
    public function findMainEnabledNavBarItems(): array
    {
        $qb = $this->createQueryBuilder('i')
            ->where('i.menu = 1')
            ->andWhere('i.parent IS NULL')
        ;

        $qb = $this->whereIsEnabled($qb);

        $qb->orderBy('i.parent');
        $qb->addOrderBy('i.position');

        return $qb->getQuery()->getResult();
    }

    private function whereIsEnabled(QueryBuilder $qb)
    {
        $qb->leftJoin('i.Page', 'page')
            ->andWhere(
                'i.isEnabled = :isEnabled AND (page.id IS NULL OR (page.id IS NOT NULL AND page.isEnabled = :isEnabled))'
            )
            ->setParameter('isEnabled', true)
        ;

        return $qb;
    }
}
