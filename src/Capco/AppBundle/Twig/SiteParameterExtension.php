<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Cache\RedisCache;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use Symfony\Component\HttpFoundation\RequestStack;

class SiteParameterExtension extends AbstractExtension
{
    public const CACHE_KEY = 'getSiteParameterValue';
    protected $resolver;
    protected $cache;
    protected $requestStack;

    public function __construct(SiteParameterResolver $resolver, RedisCache $cache, RequestStack $requestStack)
    {
        $this->resolver = $resolver;
        $this->cache = $cache;
        $this->requestStack = $requestStack;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'capco_site_parameter_value',
                [$this, 'getSiteParameterValue'],
                ['is_safe' => ['html']]
            )
        ];
    }

    public function getSiteParameterValue(string $key)
    {
        $request = $this->requestStack->getCurrentRequest();
        $defaultLocale = $this->resolver->getDefaultLocale();
        $locale = $request ? $request->getLocale() : $defaultLocale;
        $cachedItem = $this->cache->getItem(self::CACHE_KEY . $key . $locale);

        if (!$cachedItem->isHit()) {
            $data = $this->resolver->getValue($key, $locale);
            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }
}
