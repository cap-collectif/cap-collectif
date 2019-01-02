<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Capco\AppBundle\Repository\MenuItemRepository;

class FooterExtension extends \Twig_Extension
{
    public const CACHE_KEY_LINKS = 'getFooterLinks';
    public const CACHE_KEY_SOCIAL_NETWORKS = 'getFooterSocialNetworks';

    protected $menuItemRepository;
    protected $footerSocialNetworkRepository;
    protected $cache;

    public function __construct(
        MenuItemRepository $menuItemRepository,
        FooterSocialNetworkRepository $footerSocialNetworkRepository,
        RedisCache $cache
    ) {
        $this->menuItemRepository = $menuItemRepository;
        $this->footerSocialNetworkRepository = $footerSocialNetworkRepository;
        $this->cache = $cache;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('getFooterLinks', [$this, 'getFooterLinks']),
            new \Twig_SimpleFunction('getFooterSocialNetworks', [$this, 'getFooterSocialNetworks']),
        ];
    }

    public function getFooterLinks(): array
    {
        $cachedItem = $this->cache->getItem(self::CACHE_KEY_LINKS);

        if (!$cachedItem->isHit()) {
            $data = $this->menuItemRepository->getParentItems(MenuItem::TYPE_FOOTER);
            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }

    public function getFooterSocialNetworks(): array
    {
        $cachedItem = $this->cache->getItem(self::CACHE_KEY_SOCIAL_NETWORKS);

        if (!$cachedItem->isHit()) {
            $data = $this->footerSocialNetworkRepository->getEnabled();
            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }
}
