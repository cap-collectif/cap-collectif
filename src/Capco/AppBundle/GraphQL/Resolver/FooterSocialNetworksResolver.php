<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\GraphQL\Resolver\Locale\GraphQLLocaleResolver;
use Capco\AppBundle\Manager\MenuItemResolver;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class FooterSocialNetworksResolver
{
    final public const CACHE_KEY_LEGALS = 'getLegalsPages';
    final public const CACHE_KEY_SOCIAL_NETWORKS = 'getFooterSocialNetworks';

    public function __construct(
        protected MenuItemRepository $menuItemRepository,
        protected FooterSocialNetworkRepository $footerSocialNetworkRepository,
        protected SiteParameterRepository $siteParameterRepository,
        protected RedisCache $cache,
        protected MenuItemResolver $menuItemResolver,
        protected RequestStack $requestStack,
        private readonly GraphQLLocaleResolver $localeResolver
    ) {
    }

    /**
     * @return array<array{name: string, url: string}>
     */
    public function getFooterLinks(): array
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            return [];
        }
        $locale = $this->resolveLocale($request);
        $pages = $this->menuItemRepository->getPublishedFooterPages();

        $links = array_map(fn (MenuItem $menuItem) => [
            'name' => $this->resolveMenuItemTitle($menuItem, $locale),
            'url' => $this->menuItemResolver->getMenuUrl($menuItem, $request),
        ], $pages);

        return array_values(array_filter($links, fn (array $link): bool => '' !== trim((string) $link['name'])));
    }

    public static function generateFooterLegalCacheKey(string $locale): string
    {
        return self::CACHE_KEY_LEGALS . '-' . $locale;
    }

    /**
     * @return array{'cookies': bool, 'legal': bool, 'privacy': bool}
     */
    public function getLegalsPages(): array
    {
        $request = $this->requestStack->getCurrentRequest();

        $cachedItem = $this->cache->getItem(
            self::generateFooterLegalCacheKey($request ? $request->getLocale() : '')
        );

        if (!$cachedItem->isHit()) {
            /** @var SiteParameter $cookies */
            $cookies = $this->siteParameterRepository->findOneByKeyname('cookies-list');
            $legal = $this->siteParameterRepository->findOneByKeyname('legal-mentions');
            $privacy = $this->siteParameterRepository->findOneByKeyname('privacy-policy');
            $data = [
                'cookies' => $cookies->getIsEnabled(),
                'legal' => $legal ? $legal->getIsEnabled() : false,
                'privacy' => $privacy ? $privacy->getIsEnabled() : false,
            ];
            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }

    public static function generateFooterSocialNetworksCacheKey(string $locale): string
    {
        return self::CACHE_KEY_SOCIAL_NETWORKS . '-' . $locale;
    }

    /**
     * @return array{array{'title': string, 'link': string, 'style': string}}
     */
    public function getFooterSocialNetworks(): array
    {
        $request = $this->requestStack->getCurrentRequest();
        $cachedItem = $this->cache->getItem(
            self::generateFooterSocialNetworksCacheKey($request ? $request->getLocale() : '')
        );

        if (!$cachedItem->isHit()) {
            $data = $this->footerSocialNetworkRepository->getEnabled();
            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }

    private function resolveLocale(Request $request): string
    {
        return $this->localeResolver->resolveFromRequest($request);
    }

    private function resolveMenuItemTitle(MenuItem $menuItem, string $locale): string
    {
        $title = $menuItem->getTitle($locale, true);
        if (\is_string($title) && '' !== trim($title)) {
            return $title;
        }

        if ($menuItem->getPage()) {
            $pageTitle = $menuItem->getPage()->getTitle($locale);
            if (\is_string($pageTitle) && '' !== trim($pageTitle)) {
                return $pageTitle;
            }
        }

        return '';
    }
}
