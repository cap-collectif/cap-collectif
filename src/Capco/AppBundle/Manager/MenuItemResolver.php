<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Routing\Router;
use Symfony\Component\Validator\Constraints\Url;
use Symfony\Component\Validator\Validator\ValidatorInterface;

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

    public function getEnabledMenuItemsWithChildren($menu, $currentUrl = null)
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
                    $link = $this->getMenuUrl($child->getLink());
                    $navs[] = [
                        'id' => $child->getId(),
                        'title' => $child->getTitle(),
                        'link' => $link,
                        'hasEnabledFeature' => $this->manager->containsEnabledFeature($child->getAssociatedFeatures()),
                        'active' => $this->urlMatchCurrent($link, $currentUrl),
                    ];
                }
            }
            $link = $this->getMenuUrl($parent->getLink());
            $links[] = [
                'id' => $parent->getId(),
                'title' => $parent->getTitle(),
                'link' => $link,
                'hasEnabledFeature' => $this->manager->containsEnabledFeature($parent->getAssociatedFeatures()),
                'children' => $navs,
                'active' => $this->urlMatchCurrent($link, $currentUrl),
            ];
        }

        return $links;
    }

    public function hasEnabledFeatures($menuItem)
    {
        return $this->manager->containsEnabledFeature($menuItem->getAssociatedFeatures());
    }

    public function urlMatchCurrent($link = null, $current = null)
    {
        if (!$link || !$current) {
            return false;
        }
        $fixedLink = '/' . $link;

        return $link === $current || substr($current, -\strlen($fixedLink)) === $fixedLink;
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

        if (0 === \count($errorList)) {
            return $url;
        }

        return $this->router->generate('capco_app_cms', ['url' => $url]);
    }
}
