<?php

namespace spec\Capco\UserBundle\FranceConnect;

use Capco\AppBundle\Cache\RedisCache;
use Capco\UserBundle\FranceConnect\FranceConnectOptionsModifier;
use Http\Client\Common\HttpMethodsClient;
use HWI\Bundle\OAuthBundle\OAuth\RequestDataStorageInterface;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Http\HttpUtils;

class FranceConnectResourceOwnerSpec extends ObjectBehavior
{
    public function it_use_configured_scope(
        HttpMethodsClient $httpClient,
        HttpUtils $httpUtils,
        FranceConnectOptionsModifier $optionsModifier,
        RequestDataStorageInterface $storage,
        RedisCache $redisCache,
        SessionInterface $session
    ) {
        $options = [
            'access_token_url' => '',
            'authorization_url' => '',
            'client_id' => '',
            'client_secret' => '',
            'infos_url' => '',
            'logout_url' => '',
        ];
        $optionsModifier->modifyOptions($options, Argument::any())->willReturn($options);

        $this->beConstructedWith(
            $httpClient,
            $httpUtils,
            $options,
            'name',
            $optionsModifier,
            $storage,
            $redisCache,
            $session
        );
        $optionsModifier->getAllowedData()->willReturn(['given_name', 'family_name', 'birthplace']);

        $this->getScope()->shouldReturn('openid given_name family_name birthplace');
    }

    public function it_generates_nonce_if_it_is_not_found_in_storage(
        HttpMethodsClient $httpClient,
        HttpUtils $httpUtils,
        FranceConnectOptionsModifier $optionsModifier,
        RequestDataStorageInterface $storage,
        RedisCache $redisCache,
        SessionInterface $session
    ): void {
        $options = ['access_token_url' => '', 'authorization_url' => '', 'client_id' => '', 'client_secret' => '', 'infos_url' => '', 'logout_url' => ''];
        $optionsModifier->modifyOptions($options, Argument::any())->willReturn($options);

        $this->beConstructedWith(
            $httpClient,
            $httpUtils,
            $options,
            'name',
            $optionsModifier,
            $storage,
            $redisCache,
            $session
        );
        $optionsModifier->getAllowedData()->willReturn(['given_name', 'family_name', 'birthplace']);

        $session->getId()->willReturn('1');
        $cacheItem = new CacheItem(FranceConnectOptionsModifier::REDIS_FRANCE_CONNECT_TOKENS_CACHE_KEY . '-1', [], false);
        $redisCache->getItem(FranceConnectOptionsModifier::REDIS_FRANCE_CONNECT_TOKENS_CACHE_KEY . '-1')->willReturn($cacheItem);

        $this->getAuthorizationUrl('redirectUri')->shouldMatch('/nonce=[a-zA-Z0-9]+/');
    }
}
