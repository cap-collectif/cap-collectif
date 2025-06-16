<?php

namespace spec\Capco\UserBundle\FranceConnect;

use Capco\AppBundle\Cache\RedisCache;
use Capco\UserBundle\FranceConnect\FranceConnectOptionsModifier;
use Capco\UserBundle\FranceConnect\FranceConnectResourceOwner;
use Capco\UserBundle\Hwi\FeatureChecker;
use Http\Client\Common\HttpMethodsClientInterface;
use HWI\Bundle\OAuthBundle\OAuth\RequestDataStorageInterface;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Http\HttpUtils;

class FranceConnectResourceOwnerSpec extends ObjectBehavior
{
    public function it_is_initializable(
        HttpMethodsClientInterface $httpClient,
        HttpUtils $httpUtils,
        FranceConnectOptionsModifier $optionsModifier,
        RequestDataStorageInterface $storage,
        RedisCache $redisCache,
        SessionInterface $session,
        FeatureChecker $featureChecker
    ) {
        $optionsModifier->modifyOptions(Argument::any(), Argument::any())->willReturn([]);
        $optionsModifier->getAllowedData()->willReturn([]);

        $this->beConstructedWith(
            $httpClient,
            $httpUtils,
            [],
            'name',
            $storage,
            $redisCache,
            $session,
            $optionsModifier,
            $featureChecker
        );

        $this->shouldHaveType(FranceConnectResourceOwner::class);
    }

    public function it_uses_configured_scope(
        HttpMethodsClientInterface $httpClient,
        HttpUtils $httpUtils,
        FranceConnectOptionsModifier $optionsModifier,
        RequestDataStorageInterface $storage,
        RedisCache $redisCache,
        SessionInterface $session,
        FeatureChecker $featureChecker
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
            $storage,
            $redisCache,
            $session,
            $optionsModifier,
            $featureChecker
        );
        $optionsModifier->getAllowedData()->willReturn(['given_name', 'family_name', 'birthplace']);

        $this->getScope()->shouldReturn('openid given_name family_name birthplace');
    }

    public function it_generates_nonce_if_it_is_not_found_in_storage(
        HttpMethodsClientInterface $httpClient,
        HttpUtils $httpUtils,
        FranceConnectOptionsModifier $optionsModifier,
        RequestDataStorageInterface $storage,
        RedisCache $redisCache,
        SessionInterface $session,
        FeatureChecker $featureChecker
    ): void {
        $options = ['access_token_url' => '', 'authorization_url' => '', 'client_id' => '', 'client_secret' => '', 'infos_url' => '', 'logout_url' => ''];
        $optionsModifier->modifyOptions($options, Argument::any())->willReturn($options);
        $featureChecker->isServiceEnabled('franceconnect')->willReturn(true);
        $this->beConstructedWith(
            $httpClient,
            $httpUtils,
            $options,
            'name',
            $storage,
            $redisCache,
            $session,
            $optionsModifier,
            $featureChecker
        );
        $optionsModifier->getAllowedData()->willReturn(['given_name', 'family_name', 'birthplace']);

        $session->getId()->willReturn('1');
        $cacheItem = new CacheItem(FranceConnectOptionsModifier::REDIS_FRANCE_CONNECT_TOKENS_CACHE_KEY . '-1', [], false);
        $redisCache->getItem(FranceConnectOptionsModifier::REDIS_FRANCE_CONNECT_TOKENS_CACHE_KEY . '-1')->willReturn($cacheItem);

        $this->getAuthorizationUrl('redirectUri')->shouldMatch('/nonce=[a-zA-Z0-9]+/');
    }
}
