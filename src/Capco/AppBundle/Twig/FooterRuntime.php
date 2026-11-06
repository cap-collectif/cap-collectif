<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Enum\TranslationLocale;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Service\FooterLinksProvider;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Twig\Extension\RuntimeExtensionInterface;

class FooterRuntime implements RuntimeExtensionInterface
{
    final public const CACHE_KEY_LEGALS = 'getLegalsPages';
    final public const CACHE_KEY_SOCIAL_NETWORKS = 'getFooterSocialNetworks';

    protected $footerSocialNetworkRepository;
    protected $siteParameterRepository;
    protected $cache;
    protected $requestStack;

    public function __construct(
        FooterSocialNetworkRepository $footerSocialNetworkRepository,
        SiteParameterRepository $siteParameterRepository,
        RedisCache $cache,
        RequestStack $requestStack,
        private readonly FooterLinksProvider $footerLinksProvider,
    ) {
        $this->footerSocialNetworkRepository = $footerSocialNetworkRepository;
        $this->siteParameterRepository = $siteParameterRepository;
        $this->cache = $cache;
        $this->requestStack = $requestStack;
    }

    public function getFooterLinks(): array
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            return [];
        }

        return $this->footerLinksProvider->getLinks($request, $this->resolveLocale($request));
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

    public function getLegalsPages(bool $useCache = true)
    {
        $request = $this->requestStack->getCurrentRequest();

        $cachedItem = $useCache ? $this->cache->getItem(
            self::generateFooterLegalCacheKey($request ? $request->getLocale() : '')
        ) : null;

        if (!$cachedItem || !$cachedItem->isHit()) {
            /** @var SiteParameter $cookies */
            $cookies = $this->siteParameterRepository->findOneByKeyname('cookies-list');
            $legal = $this->siteParameterRepository->findOneByKeyname('legal-mentions');
            $privacy = $this->siteParameterRepository->findOneByKeyname('privacy-policy');
            $data = [
                'cookies' => $cookies ? $cookies->getIsEnabled() : false,
                'legal' => $legal ? $legal->getIsEnabled() : false,
                'privacy' => $privacy ? $privacy->getIsEnabled() : false,
            ];
            if ($cachedItem) {
                $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
                $this->cache->save($cachedItem);
            }

            return $data;
        }

        return $cachedItem->get();
    }

    public static function generateFooterSocialNetworksCacheKey(string $locale): string
    {
        return self::CACHE_KEY_SOCIAL_NETWORKS . '-' . $locale;
    }

    public function getFooterSocialNetworks(bool $useCache = true): array
    {
        $request = $this->requestStack->getCurrentRequest();
        $cachedItem = $useCache ? $this->cache->getItem(
            self::generateFooterSocialNetworksCacheKey($request ? $request->getLocale() : '')
        ) : null;

        if (!$cachedItem || !$cachedItem->isHit()) {
            $data = $this->footerSocialNetworkRepository->getEnabled($useCache);
            if ($cachedItem) {
                $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
                $this->cache->save($cachedItem);
            }

            return $data;
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
}
