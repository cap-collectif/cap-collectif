<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\UserBundle\Repository\UserTypeRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Twig\Extension\RuntimeExtensionInterface;

class UserTypeRuntime implements RuntimeExtensionInterface
{
    public const CACHE_KEY = 'userTypes';
    protected UserTypeRepository $repo;
    protected RedisCache $cache;
    protected RequestStack $requestStack;
    protected string $defaultLocale;

    public function __construct(
        UserTypeRepository $repo,
        RedisCache $cache,
        RequestStack $requestStack,
        LocaleResolver $localeResolver
    ) {
        $this->repo = $repo;
        $this->cache = $cache;
        $this->requestStack = $requestStack;
        $this->defaultLocale = $localeResolver->getDefaultLocaleCodeForRequest();
    }

    public function getUserTypes(): array
    {
        $cachedItem = $this->cache->getItem(self::CACHE_KEY);
        $locale = $this->requestStack->getCurrentRequest()
            ? $this->requestStack->getCurrentRequest()->getLocale()
            : null;
        if (null === $locale || empty($locale)) {
            $locale = $this->defaultLocale;
        }
        if (!$cachedItem->isHit()) {
            $data = $this->repo->findAllToArray($locale);
            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }
}
