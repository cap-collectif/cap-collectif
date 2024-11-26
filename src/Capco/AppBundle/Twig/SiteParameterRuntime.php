<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Psr\Cache\CacheItemInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Twig\Extension\RuntimeExtensionInterface;

class SiteParameterRuntime implements RuntimeExtensionInterface
{
    final public const CACHE_KEY = 'getSiteParameterValue';
    protected SiteParameterResolver $resolver;
    protected RedisCache $cache;
    protected RequestStack $requestStack;

    public function __construct(
        SiteParameterResolver $resolver,
        RedisCache $cache,
        RequestStack $requestStack
    ) {
        $this->resolver = $resolver;
        $this->cache = $cache;
        $this->requestStack = $requestStack;
    }

    public function getSiteParameterValue(string $key)
    {
        $request = $this->requestStack->getCurrentRequest();
        $defaultLocale = $this->resolver->getDefaultLocale();
        $locale = $request ? $request->getLocale() : $defaultLocale;
        /** @var CacheItemInterface $cachedItem */
        $cachedItem = $this->cache->getItem(self::getCacheKey($key, $locale));
        // sometimes, the cache failed, the item is hited but value is null. So, in this case we force to get the value
        if (!$cachedItem->isHit() || ($cachedItem->isHit() && !$cachedItem->get())) {
            $data = $this->resolver->getValue($key, $locale);
            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }

    public function invalidateCache(string $key): void
    {
        $defaultLocale = $this->resolver->getDefaultLocale();
        $request = $this->requestStack->getCurrentRequest();
        $locale = $request ? $request->getLocale() : $defaultLocale;
        $this->cache->deleteItem(self::getCacheKey($key, $locale));
    }

    public static function getCacheKey(string $key, string $locale): string
    {
        return self::CACHE_KEY . $key . $locale;
    }
}
