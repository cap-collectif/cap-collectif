<?php

namespace Capco\UserBundle\FranceConnect;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use HWI\Bundle\OAuthBundle\OAuth\OptionsModifier\AbstractOptionsModifier;
use HWI\Bundle\OAuthBundle\OAuth\OptionsModifier\OptionsModifierInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;

class FranceConnectOptionsModifier extends AbstractOptionsModifier implements
    OptionsModifierInterface
{
    protected const REDIS_CACHE_KEY = 'FranceConnectSSOConfiguration';

    protected $repository;
    protected $redisCache;
    protected $toggleManager;

    public function __construct(
        FranceConnectSSOConfigurationRepository $repository,
        RedisCache $redisCache,
        Manager $toggleManager
    ) {
        $this->repository = $repository;
        $this->redisCache = $redisCache;
        $this->toggleManager = $toggleManager;
    }

    public function modifyOptions(array $options, ResourceOwnerInterface $resourceOwner): array
    {
        if (!$this->toggleManager->isActive('login_franceconnect')) {
            return $options;
        }

        $ssoConfigurationCachedItem = $this->redisCache->getItem(
            self::REDIS_CACHE_KEY . ' - ' . $resourceOwner->getName()
        );

        if (!$ssoConfigurationCachedItem->isHit()) {
            $newSsoConfiguration = $this->repository->findOneBy([
                'enabled' => true
            ]);

            if (!$newSsoConfiguration) {
                $ssoConfigurationCachedItem
                    ->set($options)
                    ->expiresAfter($this->redisCache::ONE_MINUTE);
            } else {
                $ssoConfigurationCachedItem
                    ->set([
                        'client_id' => $newSsoConfiguration->getClientId(),
                        'client_secret' => $newSsoConfiguration->getSecret(),
                        'access_token_url' => $newSsoConfiguration->getAccessTokenUrl(),
                        'authorization_url' => $newSsoConfiguration->getAuthorizationUrl(),
                        'infos_url' => $newSsoConfiguration->getUserInfoUrl(),
                        'logout_url' => $newSsoConfiguration->getLogoutUrl()
                    ])
                    ->expiresAfter($this->redisCache::ONE_DAY);
            }
        }

        return array_merge($options, $ssoConfigurationCachedItem->get());
    }
}
