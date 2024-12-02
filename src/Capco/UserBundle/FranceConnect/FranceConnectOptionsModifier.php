<?php

namespace Capco\UserBundle\FranceConnect;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Hwi\OptionsModifierInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class FranceConnectOptionsModifier implements OptionsModifierInterface
{
    final public const REDIS_FRANCE_CONNECT_TOKENS_CACHE_KEY = 'FranceConnect_tokens';
    final public const SESSION_FRANCE_CONNECT_STATE_KEY = 'FranceConnect_state';
    final public const FRANCE_CONNECT_CONNECTION_MAX_TIME = 5;
    protected const REDIS_CACHE_KEY = 'FranceConnectSSOConfiguration';

    public function __construct(protected FranceConnectSSOConfigurationRepository $repository, protected RedisCache $redisCache, protected Manager $toggleManager, protected SessionInterface $session)
    {
    }

    public function getAllowedData(): array
    {
        if (!$this->toggleManager->isActive('login_franceconnect')) {
            return [];
        }

        $fc = $this->repository->find('franceConnect');

        return array_keys(array_filter($fc->getAllowedData()));
    }

    public function modifyOptions(array $options, ResourceOwnerInterface $resourceOwner): array
    {
        if (!$this->toggleManager->isActive('login_franceconnect')) {
            return $options;
        }

        if (!$this->session->isStarted()) {
            $this->session->start();
        }

        $state = $this->session->get(self::SESSION_FRANCE_CONNECT_STATE_KEY);

        if (empty($state)) {
            $state = $this->generateRandomValue();

            $this->session->set(self::SESSION_FRANCE_CONNECT_STATE_KEY, $state);

            /** * @var CacheItem $fcTokens  */
            $fcTokens = $this->redisCache->getItem(self::REDIS_FRANCE_CONNECT_TOKENS_CACHE_KEY . '-' . $this->session->getId());

            if (!$fcTokens->isHit()) {
                $nonce = $this->generateRandomValue();

                $fcTokens
                    ->set(['nonce' => $nonce, 'state' => $state])
                    ->expiresAfter($this->redisCache::ONE_MINUTE * self::FRANCE_CONNECT_CONNECTION_MAX_TIME)
                ;
                $this->redisCache->save($fcTokens);
            }
        }

        /** * @var CacheItem $ssoConfigurationCachedItem  */
        $ssoConfigurationCachedItem = $this->redisCache->getItem(
            self::REDIS_CACHE_KEY . '-' . $resourceOwner->getName() . '-' . $this->session->getId()
        );

        if (!$ssoConfigurationCachedItem->isHit()) {
            $newSsoConfiguration = $this->repository->findOneBy([
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
            $this->redisCache->save($ssoConfigurationCachedItem);
        }

        return array_merge($options, $ssoConfigurationCachedItem->get());
    }

    protected function generateRandomValue(): string
    {
        return md5(microtime(true) . uniqid('', true));
    }
}
