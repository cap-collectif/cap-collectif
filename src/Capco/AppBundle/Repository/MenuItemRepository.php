<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\MenuItem;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;

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
            ->addOrderBy('i.position', 'ASC')
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

    /**
     * @param array<int> $ids the menu items allowed by the enabled features
     */
    public function getAdminPaginated(array $ids, ?string $search = null, ?int $offset = null, ?int $limit = null): Paginator
    {
        // Each root item is followed by its sub items
        $qb = $this->getAdminQueryBuilder($ids, $search)
            ->leftJoin('mi.parent', 'parent')
            ->addSelect('COALESCE(parent.position, mi.position) AS HIDDEN rootPosition')
            ->addSelect('COALESCE(parent.id, mi.id) AS HIDDEN rootId')
            ->addSelect('CASE WHEN parent.id IS NULL THEN 0 ELSE 1 END AS HIDDEN isChild')
            ->orderBy('mi.menu', 'ASC')
            ->addOrderBy('rootPosition', 'ASC')
            ->addOrderBy('rootId', 'ASC')
            ->addOrderBy('isChild', 'ASC')
            ->addOrderBy('mi.position', 'ASC')
            ->addOrderBy('mi.id', 'ASC')
        ;

        if (null !== $offset) {
            $qb->setFirstResult($offset);
        }

        if (null !== $limit) {
            $qb->setMaxResults($limit);
        }

        return new Paginator($qb);
    }

    /**
     * @param array<int> $ids the menu items allowed by the enabled features
     */
    public function countAdmin(array $ids, ?string $search = null): int
    {
        return (int) $this->getAdminQueryBuilder($ids, $search)
            ->select('COUNT(DISTINCT mi.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    /**
     * Header root items without link, the only ones that can hold sub menus.
     *
     * @return array<MenuItem>
     */
    public function getParentCandidates(): array
    {
        return $this->createQueryBuilder('mi')
            ->leftJoin('mi.translations', 'mit')
            ->where('mi.parent IS NULL')
            ->andWhere('mi.menu = :header')
            ->andWhere('mit.link IS NULL OR mit.link = :blankLink')
            ->setParameter('header', MenuItem::TYPE_HEADER)
            ->setParameter('blankLink', '')
            ->orderBy('mi.position', 'ASC')
            ->addOrderBy('mi.id', 'ASC')
            ->distinct()
            ->getQuery()
            ->getResult()
        ;
    }

    public function hasChildren(MenuItem $menuItem): bool
    {
        if (null === $menuItem->getId()) {
            return false;
        }

        return (int) $this->createQueryBuilder('mi')
            ->select('COUNT(mi.id)')
            ->where('mi.parent = :menuItem')
            ->setParameter('menuItem', $menuItem)
            ->getQuery()
            ->getSingleScalarResult() > 0;
    }

    /**
     * @param array<int> $ids
     */
    private function getAdminQueryBuilder(array $ids, ?string $search = null): QueryBuilder
    {
        $qb = $this->createQueryBuilder('mi')
            ->leftJoin('mi.translations', 'mit')
            ->andWhere('mi.id IN (:ids)')
            ->setParameter('ids', $ids)
        ;

        if (null !== $search && '' !== trim($search)) {
            $qb
                ->andWhere('mit.title LIKE :search')
                ->setParameter('search', '%' . trim($search) . '%')
            ;
        }

        return $qb;
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
