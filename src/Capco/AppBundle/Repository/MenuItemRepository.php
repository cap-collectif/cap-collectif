<?php

namespace Capco\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Menu;
use Capco\AppBundle\Entity\MenuItem;
use Doctrine\ORM\QueryBuilder;

/**
 * MenuItemRepository
 */
class MenuItemRepository extends EntityRepository
{
    public function getParentItems(Menu $menu)
    {
        $qb = $this->createQueryBuilder('i')
            ->select('i.id, i.title, i.link')
            ->andWhere('i.parent IS NULL')
            ->andWhere('i.Menu = :menu')
            ->setParameter('menu', $menu)
            ->addOrderBy('i.position', 'ASC');

        $qb = $this->whereIsEnabled($qb);

        $result = $qb
            ->getQuery()
            ->getArrayResult();

        return $result;
    }

    public function getChildItems(Menu $menu)
    {
        $qb = $this->createQueryBuilder('i')
            ->select('i.id, i.title, i.link, p.id as parent_id')
            ->leftJoin('i.parent', 'p')
            ->andWhere('i.parent IS NOT NULL')
            ->andWhere('i.Menu = :menu')
            ->setParameter('menu', $menu)
            ->addOrderBy('i.position', 'ASC');

        $qb = $this->whereIsEnabled($qb);

        $result = $qb
            ->getQuery()
            ->getArrayResult();

        return $result;
    }

    public function getParentsItemsWithChildrenItems(Menu $menu)
    {
        $parentsLinks = $this->getParentItems($menu);
        $childrenLinks = $this->getChildItems($menu);

        $links = [];
        foreach ($parentsLinks as $key => $value) {
            $links[$value['id']] = [
                'title' => $value['title'],
                'link' => $value['link'],
                'children' => []
            ];
        }

        foreach ($childrenLinks as $key => $value) {
            if (array_key_exists($value['parent_id'], $links)) {
                $links[$value['parent_id']]['children'][] = [
                    'id' => $value['id'],
                    'title' => $value['title'],
                    'link' => $value['link'], 
                ];
            }
        }

        return $links;
    }

    private function whereIsEnabled(QueryBuilder $qb)
    {
        $qb->leftJoin('i.Page', 'page')
            ->andWhere('(page.id IS NULL AND i.isEnabled = :isEnabled) OR (page.id IS NOT NULL AND page.isEnabled = :isEnabled)')
            ->setParameter('isEnabled', true);
        return $qb;
    }
}
