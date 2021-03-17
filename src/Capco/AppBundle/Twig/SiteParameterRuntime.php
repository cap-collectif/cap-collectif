<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Psr\Cache\CacheItemInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Twig\Extension\RuntimeExtensionInterface;

class SiteParameterRuntime implements RuntimeExtensionInterface
{
    public const CACHE_KEY = 'getSiteParameterValue';
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
        $cachedItem = $this->cache->getItem(self::CACHE_KEY . $key . $locale);

        if (!$cachedItem->isHit()) {
            $data = $this->resolver->getValue($key, $locale);
            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }
}
