<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Toggle\Manager;

class MenuItemResolver
{
    protected $repository;
    protected $manager;

    public function __construct(MenuItemRepository $repository, Manager $toggleManager)
    {
        $this->repository = $repository;
        $this->manager = $toggleManager;
    }

    /**
     * @param $menu
     *
     * @return array
     */
    public function getEnabledMenuItemsWithChildren($menu)
    {
        if (!$menu) {
            return [];
        }

        $parents = $this->repository->getParentItems($menu);
        $children = $this->repository->getChildItems($menu);
        $links = [];

        foreach ($parents as $parent) {
            $navs = [];
            foreach ($children as $child) {
                if ($child->getParent()->getId() === $parent->getId()) {
                    $navs[] = [
                    'id' => $child->getId(),
                    'title' => $child->getTitle(),
                    'link' => $child->getLink(),
                    'hasEnabledFeature' => $this->manager->containsEnabledFeature($child->getAssociatedFeatures()),
                ];
                }
            }
            $links[] = [
                'id' => $parent->getId(),
                'title' => $parent->getTitle(),
                'link' => $parent->getLink(),
                'hasEnabledFeature' => $this->manager->containsEnabledFeature($parent->getAssociatedFeatures()),
                'children' => $navs,
            ];
        }

        return $links;
    }

    public function hasEnabledFeatures($menuItem)
    {
        return $this->manager->containsEnabledFeature($menuItem->getAssociatedFeatures());
    }
}
