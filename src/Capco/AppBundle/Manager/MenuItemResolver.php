<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Routing\Router;
use Symfony\Component\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints\Url;

class MenuItemResolver
{
    protected $repository;
    protected $manager;
    protected $router;
    protected $validator;

    public function __construct(MenuItemRepository $repository, Manager $toggleManager, Router $router, ValidatorInterface $validator)
    {
        $this->repository = $repository;
        $this->manager = $toggleManager;
        $this->router = $router;
        $this->validator = $validator;
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
                        'link' => $this->getMenuUrl($child->getLink()),
                        'hasEnabledFeature' => $this->manager->containsEnabledFeature($child->getAssociatedFeatures()),
                    ];
                }
            }
            $links[] = [
                'id' => $parent->getId(),
                'title' => $parent->getTitle(),
                'link' => $this->getMenuUrl($parent->getLink()),
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

    public function getMenuUrl($url)
    {
        if ('/' === $url) {
            return $this->router->generate('app_homepage');
        }

        $constraint = new Url();
        $errorList = $this->validator->validate(
            $url,
            $constraint
        );

        if (count($errorList) == 0) {
            return $url;
        }

        return $this->router->generate('capco_app_cms', ['url' => $url]);
    }
}
