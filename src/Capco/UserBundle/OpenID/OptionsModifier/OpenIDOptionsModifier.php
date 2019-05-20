<?php

namespace Capco\UserBundle\OpenID\OptionsModifier;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use HWI\Bundle\OAuthBundle\OAuth\OptionsModifier\AbstractOptionsModifier;
use HWI\Bundle\OAuthBundle\OAuth\OptionsModifier\OptionsModifierInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;

class OpenIDOptionsModifier extends AbstractOptionsModifier implements OptionsModifierInterface
{
    protected const REDIS_CACHE_KEY = 'SSOConfiguration';

    protected $oauthSsoConfigurationRepository;
    protected $redisCache;

    public function __construct(
        Oauth2SSOConfigurationRepository $oauthSsoConfigurationRepository,
        RedisCache $redisCache
    ) {
        $this->oauthSsoConfigurationRepository = $oauthSsoConfigurationRepository;
        $this->redisCache = $redisCache;
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
                throw new \RuntimeException('Could not find SSO configuration.');
            }

            $ssoConfigurationCachedItem
                ->set([
                    'client_id' => $newSsoConfiguration->getClientId(),
                    'client_secret' => $newSsoConfiguration->getSecret(),
                    'access_token_url' => $newSsoConfiguration->getAccessTokenUrlId(),
                    'authorization_url' => $newSsoConfiguration->getAuthorizationUrl(),
                    'infos_url' => $newSsoConfiguration->getUserInfoUrl(),
                    'logout_url' => $newSsoConfiguration->getLogoutUrl(),
                ])
                ->expiresAfter($this->redisCache::ONE_DAY);
        }

        return array_merge($options, $ssoConfigurationCachedItem->get());
    }
}
