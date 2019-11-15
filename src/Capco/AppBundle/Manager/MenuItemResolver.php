<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Cache\RedisCache;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Validator\Constraints\Url;
use Capco\AppBundle\Repository\MenuItemRepository;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class MenuItemResolver
{
    public const MENU_CACHE_KEY = 'getEnabledMenuItemsWithChildren';
    protected $repository;
    protected $manager;
    protected $router;
    protected $validator;
    protected $cache;
    protected $requestStack;

    public function __construct(
        MenuItemRepository $repository,
        Manager $toggleManager,
        RouterInterface $router,
        ValidatorInterface $validator,
        RedisCache $cache,
        RequestStack $requestStack
    ) {
        $this->repository = $repository;
        $this->manager = $toggleManager;
        $this->router = $router;
        $this->validator = $validator;
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
                preg_replace('/[^A-Za-z0-9\-]/', '', $currentUrl) .
                ($request ? $request->getLocale() : '')
        );

        if (!$cachedItem->isHit()) {
            $parents = $this->repository->getParentItems($menu);
            $children = $this->repository->getChildItems($menu);
            $links = [];

            foreach ($parents as $parent) {
                $navs = [];
                foreach ($children as $child) {
                    if ($child->getParent()->getId() === $parent->getId()) {
                        $link = $this->getMenuUrl($child);
                        $navs[] = [
                            'id' => $child->getId(),
                            'title' => $child->getTitle(),
                            'link' => $link,
                            'hasEnabledFeature' => $this->manager->containsEnabledFeature(
                                $child->getAssociatedFeatures()
                            ),
                            'active' => $this->urlMatchCurrent($link, $currentUrl)
                        ];
                    }
                }
                $link = $this->getMenuUrl($parent);
                $links[] = [
                    'id' => $parent->getId(),
                    'title' => $parent->getTitle(),
                    'link' => $link,
                    'hasEnabledFeature' => $this->manager->containsEnabledFeature(
                        $parent->getAssociatedFeatures()
                    ),
                    'children' => $navs,
                    'active' => $this->urlMatchCurrent($link, $currentUrl)
                ];
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
    public function getMenuUrl(MenuItem $item): string
    {
        if ($item->getPage()) {
            return $this->router->generate('app_page_show', [
                'slug' => $item->getPage()->translate()->getSlug()
            ]);
        }
        $url = $item->getLink();
        if ('/' === $url) {
            return $this->router->generate('app_homepage');
        }

        $constraint = new Url([
            'message' => 'not_valid_url',
            'payload' => ['severity' => 'warning']
        ]);
        $errorList = $this->validator->validate($url, $constraint);

        if (0 === \count($errorList)) {
            return $url ?? '';
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
