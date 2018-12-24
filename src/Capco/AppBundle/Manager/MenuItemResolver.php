<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Routing\Router;
use Symfony\Component\Validator\Constraints\Url;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Capco\AppBundle\Cache\RedisCache;

class MenuItemResolver
{
    public const MENU_CACHE_KEY = 'getEnabledMenuItemsWithChildren';
    protected $repository;
    protected $manager;
    protected $router;
    protected $validator;
    protected $cache;

    public function __construct(
        MenuItemRepository $repository,
        Manager $toggleManager,
        Router $router,
        ValidatorInterface $validator,
        RedisCache $cache
    ) {
        $this->repository = $repository;
        $this->manager = $toggleManager;
        $this->router = $router;
        $this->validator = $validator;
        $this->cache = $cache;
    }

    public function getEnabledMenuItemsWithChildren($menu, $currentUrl = null)
    {
        if (!$menu) {
            return [];
        }

        $cachedItem = $this->cache->getItem(
            self::MENU_CACHE_KEY .
                '-' .
                $menu .
                '-' .
                preg_replace('/[^A-Za-z0-9\-]/', '', $currentUrl)
        );

        if (!$cachedItem->isHit()) {
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
                            'hasEnabledFeature' => $this->manager->containsEnabledFeature(
                                $child->getAssociatedFeatures()
                            ),
                            'active' => $this->urlMatchCurrent($link, $currentUrl),
                        ];
                    }
                }
                $link = $this->getMenuUrl($parent->getLink());
                $links[] = [
                    'id' => $parent->getId(),
                    'title' => $parent->getTitle(),
                    'link' => $link,
                    'hasEnabledFeature' => $this->manager->containsEnabledFeature(
                        $parent->getAssociatedFeatures()
                    ),
                    'children' => $navs,
                    'active' => $this->urlMatchCurrent($link, $currentUrl),
                ];
            }

            $cachedItem->set($links)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
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

        $constraint = new Url([
            'message' => 'not_valid_url',
            'payload' => ['severity' => 'warning'],
        ]);
        $errorList = $this->validator->validate($url, $constraint);

        if (0 === \count($errorList)) {
            return $url;
        }

        return $this->router->generate('capco_app_cms', ['url' => $url]);
    }

    private function urlMatchCurrent($link = null, $current = null)
    {
        if (!$link || !$current) {
            return false;
        }
        $fixedLink = '/' . $link;

        return $link === $current || substr($current, -\strlen($fixedLink)) === $fixedLink;
    }
}
