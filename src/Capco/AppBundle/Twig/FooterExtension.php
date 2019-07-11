<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;

class FooterExtension extends \Twig_Extension
{
    public const CACHE_KEY_LEGALS = 'getLegalsPages';
    public const CACHE_KEY_LINKS = 'getFooterLinks';
    public const CACHE_KEY_SOCIAL_NETWORKS = 'getFooterSocialNetworks';

    protected $menuItemRepository;
    protected $footerSocialNetworkRepository;
    protected $siteParameterRepository;
    protected $cache;

    public function __construct(
        MenuItemRepository $menuItemRepository,
        FooterSocialNetworkRepository $footerSocialNetworkRepository,
        SiteParameterRepository $siteParameterRepository,
        RedisCache $cache
    ) {
        $this->menuItemRepository = $menuItemRepository;
        $this->footerSocialNetworkRepository = $footerSocialNetworkRepository;
        $this->siteParameterRepository = $siteParameterRepository;
        $this->cache = $cache;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('getFooterLinks', [$this, 'getFooterLinks']),
            new \Twig_SimpleFunction('getFooterSocialNetworks', [$this, 'getFooterSocialNetworks']),
            new \Twig_SimpleFunction('getLegalsPages', [$this, 'getLegalsPages']),
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

    public function getLegalsPages()
    {
        $cachedItem = $this->cache->getItem(self::CACHE_KEY_LEGALS);
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
