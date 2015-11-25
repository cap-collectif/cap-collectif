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
        $this->manager    = $toggleManager;
    }

    /**
     * @param $menu
     *
     * @return array
     */
    public function getEnabledMenuItemsWithChildren($menu)
    {
        if (null !== $menu) {
            $parents  = $this->repository->getParentItems($menu);
            $children = $this->repository->getChildItems($menu);
            $links    = [];

            foreach ($parents as $parent) {
                $links[$parent->getId()] = [
                    'title'             => $parent->getTitle(),
                    'link'              => $parent->getLink(),
                    'hasEnabledFeature' => $this->manager->containsEnabledFeature($parent->getAssociatedFeatures()),
                    'children'          => [],
                ];
            }

            foreach ($children as $child) {
                if (array_key_exists($child->getParent()->getId(), $links)) {
                    $links[$child->getParent()->getId()]['children'][] = [
                        'id'                => $child->getId(),
                        'title'             => $child->getTitle(),
                        'link'              => $child->getLink(),
                        'hasEnabledFeature' => $this->manager->containsEnabledFeature($child->getAssociatedFeatures()),
                    ];
                }
            }

            return $links;
        }

        return [];
    }

    public function hasEnabledFeatures($menuItem)
    {
        return $this->manager->containsEnabledFeature($menuItem->getAssociatedFeatures());
    }
}
