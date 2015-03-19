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
     * @return array
     */
    public function getEnabledMenuItemsWithChildren($menu) {

        if (null !== $menu) {

            $parentsLinks = $this->repository->getParentItems($menu);
            $childrenLinks = $this->repository->getChildItems($menu);
            $links = [];

            foreach ($parentsLinks as $key => $value) {
                $links[$value['id']] = [
                    'title' => $value['title'],
                    'link' => $value['link'],
                    'hasEnabledFeature' => $this->manager->containsEnabledFeature($value['associatedFeatures']),
                    'children' => []
                ];
            }

            foreach ($childrenLinks as $key => $value) {
                if (array_key_exists($value['parent_id'], $links)) {
                    $links[$value['parent_id']]['children'][] = [
                        'id' => $value['id'],
                        'title' => $value['title'],
                        'link' => $value['link'],
                        'hasEnabledFeature' => $this->manager->containsEnabledFeature($value['associatedFeatures']),
                    ];
                }
            }

            return $links;
        }

        return array();
    }

    public function hasEnabledFeatures($menuItem) {
        return $this->manager->containsEnabledFeature($menuItem->getAssociatedFeatures());
    }

}
