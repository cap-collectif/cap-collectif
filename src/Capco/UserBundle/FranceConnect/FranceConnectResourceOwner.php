<?php

namespace Capco\UserBundle\FranceConnect;

use Capco\AppBundle\Cache\RedisCache;
use Http\Client\Common\HttpMethodsClient;
use HWI\Bundle\OAuthBundle\OAuth\OptionsModifier\AbstractOptionsModifier;
use HWI\Bundle\OAuthBundle\OAuth\RequestDataStorageInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\GenericOAuth2ResourceOwner;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\HttpFoundation\Request as HttpRequest;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Http\HttpUtils;

class FranceConnectResourceOwner extends GenericOAuth2ResourceOwner
{
    protected $paths = [
        'identifier' => 'sub',
        'email' => 'email',
        'firstname' => 'given_name',
        'lastname' => 'family_name',
        'nickname' => 'preferred_username',
        'birthplace' => 'birthplace',
    ];
    private RedisCache $redisCache;
    private SessionInterface $session;

    public function __construct(
        HttpMethodsClient $httpClient,
        HttpUtils $httpUtils,
        array $options,
        $name,
        AbstractOptionsModifier $optionsModifier,
        RequestDataStorageInterface $storage,
        RedisCache $redisCache,
        SessionInterface $session
    ) {
        parent::__construct($httpClient, $httpUtils, $options, $name, $optionsModifier, $storage);
        $this->redisCache = $redisCache;
        $this->session = $session;
    }

    public function getAuthorizationUrl($redirectUri, array $extraParameters = []): string
    {
        // https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service#glossary
        $nonce = $this->generateNonce();

        /** * @var CacheItem $tokens  */
        $tokens = $this->redisCache
            ->getItem(FranceConnectOptionsModifier::REDIS_FRANCE_CONNECT_TOKENS_CACHE_KEY . '-' . $this->session->getId())
            ->get()
        ;

        if (!empty($tokens)) {
            $nonce = $tokens['nonce'];
            $this->state = $tokens['state'] ?? null;
        }

        $extraParameters = array_merge($extraParameters, [
            'nonce' => $nonce,
            'acr_values' => 'eidas1',
        ]);

        return parent::getAuthorizationUrl($redirectUri, $extraParameters);
    }

    public function getAccessToken(
        HttpRequest $request,
        $redirectUri,
        array $extraParameters = []
    ): array {
        return parent::getAccessToken($request, $redirectUri, $extraParameters);
    }

    public function getScope(): string
    {
        $allowedData = $this->optionsModifier->getAllowedData();
        $scope = array_merge(['openid'], $allowedData);

        return implode(' ', $scope);
    }

    protected function configureOptions(OptionsResolver $resolver): void
    {
        parent::configureOptions($resolver);

        $resolver
            ->setDefaults([
                'scope' => $this->getScope(),
            ])
            ->setRequired('logout_url')
        ;
    }
}
