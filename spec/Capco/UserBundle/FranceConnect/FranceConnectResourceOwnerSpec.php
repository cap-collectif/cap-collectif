<?php

namespace spec\Capco\UserBundle\FranceConnect;

use Capco\AppBundle\Cache\RedisCache;
use Capco\UserBundle\FranceConnect\FranceConnectOptionsModifier;
use Http\Client\Common\HttpMethodsClient;
use HWI\Bundle\OAuthBundle\OAuth\RequestDataStorageInterface;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\Security\Http\HttpUtils;

class FranceConnectResourceOwnerSpec extends ObjectBehavior
{
    public function it_use_configured_scope(
        HttpMethodsClient $httpClient,
        HttpUtils $httpUtils,
        FranceConnectOptionsModifier $optionsModifier,
        RequestDataStorageInterface $storage,
        RedisCache $redisCache
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
            $redisCache
        );
        $optionsModifier->getAllowedData()->willReturn(['given_name', 'family_name', 'birthplace']);

        $this->getScope()->shouldReturn('openid given_name family_name birthplace');
    }
}
