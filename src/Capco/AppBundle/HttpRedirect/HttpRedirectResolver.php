<?php

namespace Capco\AppBundle\HttpRedirect;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Cache\SameRequestCache;
use Capco\AppBundle\Repository\HttpRedirectRepository;
use Psr\Cache\CacheItemPoolInterface;
use Symfony\Component\HttpFoundation\Request;

class HttpRedirectResolver
{
    private const MISS_SENTINEL = '__HTTP_REDIRECT_MISS__';
    private const NEGATIVE_CACHE_TTL = 30;

    public function __construct(
        private readonly HttpRedirectRepository $httpRedirectRepository,
        private readonly RedisCache $httpRedirectCache,
        private readonly SameRequestCache $sameRequestCache
    ) {
    }

    public function resolve(Request $request): ?ResolvedHttpRedirection
    {
        return $this->resolveRequestUri(
            (string) ($request->getRequestUri() ?? '/'),
            (string) ($request->getBaseUrl() ?? '')
        );
    }

    public function resolveRequestUri(string $requestUri, string $baseUrl = ''): ?ResolvedHttpRedirection
    {
        $fullPath = $this->normalizeRequestUri($requestUri, $baseUrl);

        $pathWithoutQuery = strtok($fullPath, '?') ?: $fullPath;
        $baseKey = $this->buildBaseCacheKey($pathWithoutQuery);
        $exactKey = $fullPath !== $pathWithoutQuery ? $this->buildExactCacheKey($fullPath) : null;

        $cacheLookup = $this->resolveFromCache($baseKey, $exactKey);
        if ($cacheLookup['hit']) {
            return $cacheLookup['redirect'];
        }

        $redirect = $this->httpRedirectRepository->findMatching($pathWithoutQuery, $fullPath);

        if (!$redirect) {
            $this->storeMisses($baseKey, $exactKey);

            return null;
        }

        $resolvedRedirect = new ResolvedHttpRedirection(
            $redirect->getDestinationUrl(),
            $redirect->getDuration(),
            $redirect->getRedirectType()
        );

        $this->storeResolvedResult($baseKey, $exactKey, $fullPath, $resolvedRedirect, $redirect->getSourceUrl());

        return $resolvedRedirect;
    }

    /**
     * @return array{hit: bool, redirect: ?ResolvedHttpRedirection}
     */
    private function resolveFromCache(string $baseKey, ?string $exactKey): array
    {
        if (null === $exactKey) {
            return $this->lookup($baseKey);
        }

        $exactLookup = $this->lookup($exactKey);
        if (null !== $exactLookup['redirect']) {
            return $exactLookup;
        }

        if ($exactLookup['hit']) {
            $baseLookup = $this->lookup($baseKey);
            if ($baseLookup['hit']) {
                return $baseLookup;
            }

            return $exactLookup;
        }

        return ['hit' => false, 'redirect' => null];
    }

    private function normalizeRequestUri(string $requestUri, string $baseUrl): string
    {
        if ('' === $requestUri) {
            return '/';
        }

        if ('/' !== $requestUri[0]) {
            $requestUri = '/' . $requestUri;
        }

        if ('' === $baseUrl) {
            return $requestUri;
        }

        $pathInfo = substr($requestUri, \strlen($baseUrl));

        if ('' === $pathInfo) {
            return '/';
        }

        return (string) $pathInfo;
    }

    private function buildBaseCacheKey(string $pathWithoutQuery): string
    {
        return 'http_redirect_resolve_base_' . sha1($pathWithoutQuery);
    }

    private function buildExactCacheKey(string $fullPath): string
    {
        return 'http_redirect_resolve_exact_' . sha1($fullPath);
    }

    /**
     * @return array{hit: bool, redirect: ?ResolvedHttpRedirection}
     */
    private function lookup(string $key): array
    {
        $sameRequestLookup = $this->lookupInCache($this->sameRequestCache, $key);
        if ($sameRequestLookup['hit']) {
            return $sameRequestLookup;
        }

        $redisLookup = $this->lookupInCache($this->httpRedirectCache, $key);
        if ($redisLookup['hit']) {
            $this->storeInCache($this->sameRequestCache, $key, $redisLookup['value']);

            return [
                'hit' => true,
                'redirect' => $redisLookup['redirect'],
            ];
        }

        return [
            'hit' => false,
            'redirect' => null,
        ];
    }

    private function storeResolvedRedirect(string $key, ResolvedHttpRedirection $resolvedRedirect): void
    {
        $payload = $resolvedRedirect->toCachePayload();
        $this->storeInCache($this->sameRequestCache, $key, $payload);
        $this->storeInCache($this->httpRedirectCache, $key, $payload);
    }

    private function storeResolvedResult(
        string $baseKey,
        ?string $exactKey,
        string $fullPath,
        ResolvedHttpRedirection $resolvedRedirect,
        string $sourceUrl
    ): void {
        if (null !== $exactKey && $sourceUrl === $fullPath) {
            $this->storeResolvedRedirect($exactKey, $resolvedRedirect);

            return;
        }

        $this->storeResolvedRedirect($baseKey, $resolvedRedirect);
        if (null !== $exactKey) {
            $this->storeMiss($exactKey);
        }
    }

    private function storeMisses(string $baseKey, ?string $exactKey): void
    {
        $this->storeMiss($baseKey);
        if (null !== $exactKey) {
            $this->storeMiss($exactKey);
        }
    }

    private function storeMiss(string $key): void
    {
        $this->storeInCache($this->sameRequestCache, $key, self::MISS_SENTINEL, self::NEGATIVE_CACHE_TTL);
        $this->storeInCache($this->httpRedirectCache, $key, self::MISS_SENTINEL, self::NEGATIVE_CACHE_TTL);
    }

    /**
     * @return array{hit: bool, redirect: ?ResolvedHttpRedirection, value?: mixed}
     */
    private function lookupInCache(CacheItemPoolInterface $cache, string $key): array
    {
        try {
            $cachedItem = $cache->getItem($key);
            if (!$cachedItem->isHit()) {
                return ['hit' => false, 'redirect' => null];
            }

            $value = $cachedItem->get();
            if (self::MISS_SENTINEL === $value) {
                return ['hit' => true, 'redirect' => null, 'value' => $value];
            }

            if (!\is_array($value)) {
                return ['hit' => false, 'redirect' => null];
            }

            $resolvedRedirect = ResolvedHttpRedirection::fromCachePayload($value);
            if (!$resolvedRedirect) {
                return ['hit' => false, 'redirect' => null];
            }

            return [
                'hit' => true,
                'redirect' => $resolvedRedirect,
                'value' => $value,
            ];
        } catch (\Throwable) {
            return ['hit' => false, 'redirect' => null];
        }
    }

    private function storeInCache(CacheItemPoolInterface $cache, string $key, mixed $value, ?int $ttl = null): void
    {
        try {
            $cacheItem = $cache->getItem($key);
            $cacheItem->set($value);
            if (null !== $ttl) {
                $cacheItem->expiresAfter($ttl);
            }
            $cache->save($cacheItem);
        } catch (\Throwable) {
            // Fail open: redirect resolution should still work even if cache storage fails.
        }
    }
}
