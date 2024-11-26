<?php

namespace Capco\UserBundle\FranceConnect;

use Capco\AppBundle\Cache\RedisCache;
use Capco\UserBundle\Hwi\FeatureChecker;
use Capco\UserBundle\Hwi\OptionsModifierInterface;
use Http\Client\Common\HttpMethodsClientInterface;
use HWI\Bundle\OAuthBundle\OAuth\RequestDataStorageInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\GenericOAuth2ResourceOwner;
use HWI\Bundle\OAuthBundle\OAuth\State\State;
use HWI\Bundle\OAuthBundle\Security\Helper\NonceGenerator;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\HttpFoundation\Request as HttpRequest;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
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
    private readonly RedisCache $redisCache;
    private readonly SessionInterface $session;
    private readonly OptionsModifierInterface $optionsModifier;
    private readonly FeatureChecker $featureChecker;

    public function __construct(
        HttpMethodsClientInterface $hwiHttpClient,
        HttpUtils $httpUtils,
        array $options,
        string $name,
        RequestDataStorageInterface $hwiStorage,
        RedisCache $redisCache,
        SessionInterface $session,
        OptionsModifierInterface $optionsModifier,
        FeatureChecker $featureChecker
    ) {
        $this->httpClient = $hwiHttpClient;
        $this->httpUtils = $httpUtils;
        $this->name = $name;
        $this->storage = $hwiStorage;
        $this->redisCache = $redisCache;
        $this->session = $session;
        $this->featureChecker = $featureChecker;
        $this->optionsModifier = $optionsModifier;

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
    }

    /**
     * {@inheritdoc}
     */
    public function getAuthorizationUrl($redirectUri, array $extraParameters = []): string
    {
        if (!$this->featureChecker->isServiceEnabled('franceconnect')) {
            throw new AuthenticationException('FranceConnect is not enabled');
        }

        // https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service#glossary
        $nonce = NonceGenerator::generate();

        /** * @var CacheItem $tokens  */
        $tokens = $this->redisCache
            ->getItem(FranceConnectOptionsModifier::REDIS_FRANCE_CONNECT_TOKENS_CACHE_KEY . '-' . $this->session->getId())
            ->get()
        ;

        if (!empty($tokens)) {
            $nonce = $tokens['nonce'];
            isset($tokens['state']) ? $this->state->setCsrfToken($tokens['state']) : null;
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
        $extraParameters = array_merge($extraParameters, [
            'client_id' => $this->options['client_id'],
            'client_secret' => $this->options['client_secret'],
        ]);

        return parent::getAccessToken($request, $redirectUri, $extraParameters);
    }

    public function getScope(): string
    {
        $scope = [];

        if (
            method_exists($this->optionsModifier, 'getAllowedData')
            && $this->optionsModifier instanceof FranceConnectOptionsModifier
        ) {
            $allowedData = $this->optionsModifier->getAllowedData();
            $scope = array_merge(['openid'], $allowedData);
        }

        return implode(' ', $scope);
    }

    /**
     * {@inheritdoc}
     */
    public function isCsrfTokenValid($csrfToken): bool
    {
        // Mark token valid when validation is disabled
        if (!$this->options['csrf']) {
            return true;
        }

        if (null === $csrfToken) {
            throw new AuthenticationException('Given CSRF token is not valid.');
        }

        try {
            return null !== $this->storage->fetch($this, urldecode($csrfToken), 'csrf_state');
        } catch (\InvalidArgumentException $e) {
            throw new AuthenticationException('Given CSRF token is not valid.');
        }
    }

    /**
     * {@inheritdoc}
     */
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
