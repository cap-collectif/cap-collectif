<?php

namespace Capco\AppBundle\Manager;


use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Toggle\Manager;

class MenuItemResolver
{
    protected $repository;
    protected $enabledFeatures;

    public function __construct(MenuItemRepository $repository, Manager $toggleManager)
    {
        $this->repository = $repository;
        $this->enabledFeatures = array_keys($toggleManager->all(true));
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
                    'hasEnabledFeature' => $this->containsEnabledFeature($value['associatedFeatures']),
                    'children' => []
                ];
            }

            foreach ($childrenLinks as $key => $value) {
                if (array_key_exists($value['parent_id'], $links)) {
                    $links[$value['parent_id']]['children'][] = [
                        'id' => $value['id'],
                        'title' => $value['title'],
                        'link' => $value['link'],
                        'hasEnabledFeature' => $this->containsEnabledFeature($value['associatedFeatures']),
                    ];
                }
            }

            return $links;
        }

        return array();
    }

    /**
     * @param $features
     * @return bool
     */
    public function containsEnabledFeature($features)
    {
        if (empty($features)) {
            return true;
        }

        foreach ($features as $feature) {
            if (in_array($feature, $this->enabledFeatures)) {
                return true;
            }
        }
        
        return false;
    }
}
