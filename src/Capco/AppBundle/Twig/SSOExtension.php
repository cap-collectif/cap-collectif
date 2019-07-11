<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class SSOExtension extends AbstractExtension
{
    protected const REDIS_CACHE_KEY = 'SSOList';
    protected $cache;
    protected $repository;

    public function __construct(RedisCache $cache, AbstractSSOConfigurationRepository $repository)
    {
        $this->cache = $cache;
        $this->repository = $repository;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('sso_list', [$this, 'getSSOList'])];
    }

    public function getSSOList(): array
    {
        $ssoList = $this->cache->getItem(self::REDIS_CACHE_KEY);

        if (!$ssoList->isHit()) {
            $newSsoList = $this->repository->getPublicList();

            $ssoList->set(json_encode($newSsoList))->expiresAfter($this->cache::ONE_MINUTE);
        }

        return json_decode($ssoList->get(), true);
    }
}
