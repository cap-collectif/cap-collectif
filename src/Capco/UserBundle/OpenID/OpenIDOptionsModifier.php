<?php

namespace Capco\UserBundle\OpenID;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Hwi\OptionsModifierInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;

class OpenIDOptionsModifier implements OptionsModifierInterface
{
    final public const REDIS_CACHE_KEY = 'SSOConfiguration';

    public function __construct(protected Oauth2SSOConfigurationRepository $oauthSsoConfigurationRepository, protected RedisCache $redisCache, protected Manager $toggleManager)
    {
    }

    public function modifyOptions(array $options, ResourceOwnerInterface $resourceOwner): array
    {
        $ssoConfigurationCachedItem = $this->redisCache->getItem(
            self::REDIS_CACHE_KEY . ' - ' . $resourceOwner->getName()
        );

        if (!$ssoConfigurationCachedItem->isHit()) {
            $newSsoConfiguration = $this->oauthSsoConfigurationRepository->findOneBy([
                'enabled' => true,
            ]);

            if (!$newSsoConfiguration) {
                $ssoConfigurationCachedItem
                    ->set($options)
                    ->expiresAfter($this->redisCache::ONE_MINUTE)
                ;
            } else {
                $ssoConfigurationCachedItem
                    ->set([
                        'client_id' => $newSsoConfiguration->getClientId(),
                        'client_secret' => $newSsoConfiguration->getSecret(),
                        'access_token_url' => $newSsoConfiguration->getAccessTokenUrl(),
                        'authorization_url' => $newSsoConfiguration->getAuthorizationUrl(),
                        'infos_url' => $newSsoConfiguration->getUserInfoUrl(),
                        'logout_url' => $newSsoConfiguration->getLogoutUrl(),
                    ])
                    ->expiresAfter($this->redisCache::ONE_DAY)
                ;
            }
        }

        return array_merge($options, $ssoConfigurationCachedItem->get());
    }
}
