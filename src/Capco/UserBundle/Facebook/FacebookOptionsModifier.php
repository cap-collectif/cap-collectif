<?php

namespace Capco\UserBundle\Facebook;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\FacebookSSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Hwi\OptionsModifierInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;

class FacebookOptionsModifier implements OptionsModifierInterface
{
    protected const REDIS_CACHE_KEY = 'FacebookSSOConfiguration';

    public function __construct(
        protected FacebookSSOConfigurationRepository $repository,
        protected RedisCache $redisCache,
        protected Manager $toggleManager
    ) {
    }

    public function modifyOptions(array $options, ResourceOwnerInterface $resourceOwner): array
    {
        $cachedSSOConfiguration = $this->redisCache->getItem(
            self::REDIS_CACHE_KEY . ' - ' . $resourceOwner->getName()
        );

        if (!$cachedSSOConfiguration->isHit()) {
            $ssoConfiguration = $this->repository->findOneBy([
                'enabled' => true,
            ]);

            if (!$ssoConfiguration) {
                $cachedSSOConfiguration->set($options)->expiresAfter($this->redisCache::ONE_MINUTE);
            } else {
                $cachedSSOConfiguration
                    ->set([
                        'client_id' => $ssoConfiguration->getClientId(),
                        'client_secret' => $ssoConfiguration->getSecret(),
                    ])
                    ->expiresAfter($this->redisCache::ONE_DAY)
                ;
            }
        }

        return array_merge($options, $cachedSSOConfiguration->get());
    }
}
