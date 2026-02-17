<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Enum\TranslationLocale;
use Capco\AppBundle\Manager\MenuItemResolver;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Twig\Extension\RuntimeExtensionInterface;

class FooterRuntime implements RuntimeExtensionInterface
{
    final public const CACHE_KEY_LEGALS = 'getLegalsPages';
    final public const CACHE_KEY_SOCIAL_NETWORKS = 'getFooterSocialNetworks';

    protected $menuItemRepository;
    protected $footerSocialNetworkRepository;
    protected $siteParameterRepository;
    protected $cache;
    protected $menuItemResolver;
    protected $requestStack;

    public function __construct(
        MenuItemRepository $menuItemRepository,
        FooterSocialNetworkRepository $footerSocialNetworkRepository,
        SiteParameterRepository $siteParameterRepository,
        RedisCache $cache,
        MenuItemResolver $menuItemResolver,
        RequestStack $requestStack
    ) {
        $this->menuItemRepository = $menuItemRepository;
        $this->footerSocialNetworkRepository = $footerSocialNetworkRepository;
        $this->siteParameterRepository = $siteParameterRepository;
        $this->cache = $cache;
        $this->menuItemResolver = $menuItemResolver;
        $this->requestStack = $requestStack;
    }

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

    public function isNextLinkEnabled(array $links, int $index): bool
    {
        return $links[$index] instanceof MenuItem
            && $links[$index]
            && $links[$index]->getIsEnabled()
            && $links[$index]->getLink();
    }

    public static function generateFooterLegalCacheKey(string $locale): string
    {
        return self::CACHE_KEY_LEGALS . '-' . $locale;
    }

    public function getLegalsPages()
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
                'cookies' => $cookies ? $cookies->getIsEnabled() : false,
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
        $queryLocale = $request->query->get('tl');
        if (\is_string($queryLocale) && TranslationLocale::isValid($queryLocale)) {
            return $queryLocale;
        }

        $cookieLocale = $request->cookies->get('locale');
        if (\is_string($cookieLocale) && TranslationLocale::isValid($cookieLocale)) {
            return $cookieLocale;
        }

        return $request->getLocale();
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
