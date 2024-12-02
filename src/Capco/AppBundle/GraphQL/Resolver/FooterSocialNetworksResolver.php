<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Manager\MenuItemResolver;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Symfony\Component\HttpFoundation\RequestStack;

class FooterSocialNetworksResolver
{
    final public const CACHE_KEY_LEGALS = 'getLegalsPages';
    final public const CACHE_KEY_SOCIAL_NETWORKS = 'getFooterSocialNetworks';

    public function __construct(protected MenuItemRepository $menuItemRepository, protected FooterSocialNetworkRepository $footerSocialNetworkRepository, protected SiteParameterRepository $siteParameterRepository, protected RedisCache $cache, protected MenuItemResolver $menuItemResolver, protected RequestStack $requestStack)
    {
    }

    /**
     * @return array<array{name: string, url: string}>
     */
    public function getFooterLinks(): array
    {
        $pages = $this->menuItemRepository->getPublishedFooterPages();

        return array_map(function ($page) {
            return [
                'name' => $page->getTitle(),
                'url' => $this->menuItemResolver->getMenuUrl(
                    $page,
                    $this->requestStack->getCurrentRequest()
                ),
            ];
        }, $pages);
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
}
