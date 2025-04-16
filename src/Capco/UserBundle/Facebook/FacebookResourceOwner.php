<?php

declare(strict_types=1);

namespace Capco\UserBundle\Facebook;

use Capco\UserBundle\Hwi\FeatureChecker;
use Capco\UserBundle\Hwi\OptionsModifierInterface;
use HWI\Bundle\OAuthBundle\OAuth\RequestDataStorageInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\GenericOAuth2ResourceOwner;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\OAuth\State\State;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\HttpUtils;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class FacebookResourceOwner extends GenericOAuth2ResourceOwner
{
    protected array $paths = [
        'identifier' => 'id',
        'nickname' => 'name',
        'firstname' => 'first_name',
        'lastname' => 'last_name',
        'realname' => 'name',
        'email' => 'email',
        'profilepicture' => 'picture.data.url',
    ];

    public function __construct(
        HttpClientInterface $hwiHttpClient,
        HttpUtils $httpUtils,
        array $options,
        string $name,
        RequestDataStorageInterface $hwiStorage,
        OptionsModifierInterface $optionsModifier,
        private readonly FeatureChecker $featureChecker,
        private ?LoggerInterface $logger = null
    ) {
        $this->httpClient = $hwiHttpClient;
        $this->httpUtils = $httpUtils;
        $this->name = $name;
        $this->storage = $hwiStorage;

        $options = $optionsModifier->modifyOptions($options, $this);
        if (!empty($options['paths'])) {
            $this->addPaths($options['paths']);
        }
        unset($options['paths']);

        if (!empty($options['options'])) {
            $options += $options['options'];
            unset($options['options']);
        }
        unset($options['options']);

        // Resolve merged options
        $resolver = new OptionsResolver();
        $this->configureOptions($resolver);
        $this->options = $resolver->resolve($options);

        $this->state = new State($this->options['state'] ?: null);

        $this->configure();
        parent::__construct($hwiHttpClient, $httpUtils, $options, $name, $hwiStorage);
    }

    /**
     * {@inheritdoc}
     */
    public function getUserInformation(array $accessToken, array $extraParameters = []): UserResponseInterface
    {
        if ($this->options['appsecret_proof']) {
            $extraParameters['appsecret_proof'] = hash_hmac('sha256', (string) $accessToken['access_token'], (string) $this->options['client_secret']);
        }

        $this->logger->debug('Get user information from Facebook.', ['extra_parameters' => $extraParameters]);

        return parent::getUserInformation($accessToken, $extraParameters);
    }

    /**
     * {@inheritdoc}
     */
    public function getAuthorizationUrl($redirectUri, array $extraParameters = []): string
    {
        if (!$this->featureChecker->isServiceEnabled('facebook')) {
            throw new AuthenticationException('Facebook is not enabled');
        }

        $extraOptions = [];
        if (isset($this->options['display'])) {
            $extraOptions['display'] = $this->options['display'];
        }

        if (isset($this->options['auth_type'])) {
            $extraOptions['auth_type'] = $this->options['auth_type'];
        }

        $this->logger->debug('Redirect user to Facebook authorization URL.', ['redirect_uri' => $redirectUri, 'extra_parameters' => $extraParameters]);

        return parent::getAuthorizationUrl($redirectUri, array_merge($extraOptions, $extraParameters));
    }

    /**
     * {@inheritdoc}
     */
    public function getAccessToken(Request $request, $redirectUri, array $extraParameters = []): array
    {
        $parameters = [];
        if ($request->query->has('fb_source')) {
            $parameters['fb_source'] = $request->query->get('fb_source');
        }

        if ($request->query->has('fb_appcenter')) {
            $parameters['fb_appcenter'] = $request->query->get('fb_appcenter');
        }

        $this->logger->debug('Get access token from Facebook.', ['redirect_uri' => $redirectUri, 'extra_parameters' => $extraParameters]);

        return parent::getAccessToken($request, $this->normalizeUrl($redirectUri, $parameters), $extraParameters);
    }

    /**
     * {@inheritdoc}
     */
    public function revokeToken($token): bool
    {
        $parameters = [
            'client_id' => $this->options['client_id'],
            'client_secret' => $this->options['client_secret'],
        ];

        $response = $this->httpRequest($this->normalizeUrl($this->options['revoke_token_url'], ['access_token' => $token]), $parameters, [], 'DELETE');

        return 200 === $response->getStatusCode();
    }

    /**
     * {@inheritdoc}
     */
    protected function configureOptions(OptionsResolver $resolver): void
    {
        parent::configureOptions($resolver);

        $resolver->setDefaults([
            'authorization_url' => 'https://www.facebook.com/v8.0/dialog/oauth',
            'access_token_url' => 'https://graph.facebook.com/v8.0/oauth/access_token',
            'revoke_token_url' => 'https://graph.facebook.com/v8.0/me/permissions',
            'infos_url' => 'https://graph.facebook.com/v8.0/me?fields=id,first_name,last_name,name,email,picture.type(large)',
            'use_commas_in_scope' => true,
            'display' => null,
            'auth_type' => null,
            'appsecret_proof' => false,
        ]);

        $resolver
            ->setAllowedValues('display', ['page', 'popup', 'touch', null]) // @link https://developers.facebook.com/docs/reference/dialogs/#display
            ->setAllowedValues('auth_type', ['rerequest', null]) // @link https://developers.facebook.com/docs/reference/javascript/FB.login/
            ->setAllowedTypes('appsecret_proof', 'bool') // @link https://developers.facebook.com/docs/graph-api/securing-requests
        ;
    }
}
