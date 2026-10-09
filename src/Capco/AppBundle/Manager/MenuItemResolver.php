<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Service\MenuItemUrlGenerator;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class MenuItemResolver
{
    final public const MENU_CACHE_KEY = 'getEnabledMenuItemsWithChildren';
    protected $repository;
    protected $manager;
    protected $cache;
    protected $requestStack;

    public function __construct(
        MenuItemRepository $repository,
        Manager $toggleManager,
        private readonly MenuItemUrlGenerator $urlGenerator,
        RedisCache $cache,
        RequestStack $requestStack
    ) {
        $this->repository = $repository;
        $this->manager = $toggleManager;
        $this->cache = $cache;
        $this->requestStack = $requestStack;
    }

    public function getEnabledMenuItemsWithChildren($menu, $currentUrl = null): array
    {
        if (!$menu) {
            return [];
        }

        $request = $this->requestStack->getCurrentRequest();
        $cachedItem = $this->cache->getItem(
            self::MENU_CACHE_KEY .
                '-' .
                $menu .
                '-' .
                preg_replace('/[^A-Za-z0-9\-]/', '', (string) $currentUrl) .
                ($request ? $request->getLocale() : '')
        );

        if (!$cachedItem->isHit()) {
            $parents = $this->repository->getParentItems($menu);
            $children = $this->repository->getChildItems($menu);
            $links = [];

            foreach ($parents as $parent) {
                $navs = [];
                if ($parent->getTitle()) {
                    foreach ($children as $child) {
                        if ($child->getParent()->getId() === $parent->getId()) {
                            $link = $this->getMenuUrl($child, $request);
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
                    $link = $this->getMenuUrl($parent, $request);
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
            }

            $cachedItem->set($links)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }

    public function hasEnabledFeatures(MenuItem $menuItem)
    {
        return $this->manager->containsEnabledFeature($menuItem->getAssociatedFeatures());
    }

    /**
     * Get the URL from a menu item.
     */
    public function getMenuUrl(MenuItem $item, Request $request): string
    {
        return $this->urlGenerator->generate($item, $request->getLocale());
    }

    private function urlMatchCurrent($link = null, $current = null)
    {
        if (!$link || !$current) {
            return false;
        }
        $fixedLink = '/' . $link;

        return $link === $current || str_ends_with((string) $current, $fixedLink);
    }
}
