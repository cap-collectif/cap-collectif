<?php

namespace Capco\UserBundle\OpenID\OptionsModifier;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use HWI\Bundle\OAuthBundle\OAuth\OptionsModifier\AbstractOptionsModifier;
use HWI\Bundle\OAuthBundle\OAuth\OptionsModifier\OptionsModifierInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;

class OpenIDOptionsModifier extends AbstractOptionsModifier implements OptionsModifierInterface
{
    public const REDIS_CACHE_KEY = 'SSOConfiguration';

    protected $oauthSsoConfigurationRepository;
    protected $redisCache;
    protected $toggleManager;

    public function __construct(
        Oauth2SSOConfigurationRepository $oauthSsoConfigurationRepository,
        RedisCache $redisCache,
        Manager $toggleManager
    ) {
        $this->oauthSsoConfigurationRepository = $oauthSsoConfigurationRepository;
        $this->redisCache = $redisCache;
        $this->toggleManager = $toggleManager;
    }

    public function modifyOptions(array $options, ResourceOwnerInterface $resourceOwner): array
    {
        $ssoConfigurationCachedItem = $this->redisCache->getItem(
            self::REDIS_CACHE_KEY . ' - ' . $resourceOwner->getName()
        );

        if (!$ssoConfigurationCachedItem->isHit()) {
            $newSsoConfiguration = $this->oauthSsoConfigurationRepository->findOneBy([
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
