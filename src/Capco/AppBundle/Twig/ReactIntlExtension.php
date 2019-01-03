<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteParameter\Resolver;
use Capco\AppBundle\Cache\RedisCache;

class ReactIntlExtension extends \Twig_Extension
{
    public const CACHE_KEY_PREFIX = 'getIntlMessages';
    private $translationFolder;
    private $resolver;
    private $env;
    private $cache;

    public function __construct(
        string $translationFolder,
        string $env,
        Resolver $resolver,
        RedisCache $cache
    ) {
        $this->translationFolder = $translationFolder;
        $this->env = $env;
        $this->resolver = $resolver;
        $this->cache = $cache;
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('intl_locale', [$this, 'getLocale']),
            new \Twig_SimpleFunction('intl_messages', [$this, 'getIntlMessages']),
        ];
    }

    public function getLocale(): string
    {
        return $this->resolver->getValue('global.locale');
    }

    public function getTranslations(string $filename): array
    {
        return json_decode(file_get_contents($this->translationFolder . $filename), true);
    }

    public function getIntlMessages()
    {
        if ('test' === $this->env) {
            return json_decode('{}');
        }

        $locale = $this->getLocale();
        $filename = 'messages.' . $locale . '.json';

        $cacheKey = self::CACHE_KEY_PREFIX . '-' . $filename;
        $cacheItem = $this->cache->getItem($cacheKey);

        if (!$cacheItem->isHit()) {
            $cacheItem->set($this->getTranslations($filename))->expiresAfter(RedisCache::ONE_DAY);
            $this->cache->save($cacheItem);
        }

        return $cacheItem->get();
    }
}
