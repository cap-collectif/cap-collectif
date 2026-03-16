<?php

namespace Capco\UserBundle\FranceConnect;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\DBAL\Enum\EnumSSOEnvironmentType;
use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Exception\FranceConnectAuthenticationException;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Capco\UserBundle\Hwi\FeatureChecker;
use Capco\UserBundle\Hwi\OptionsModifierInterface;
use Capco\UserBundle\Jwt\Jwt;
use Capco\UserBundle\Security\JWT as SecurityJwt;
use Firebase\JWT\CachedKeySet;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\HttpFactory;
use Http\Client\Common\HttpMethodsClientInterface;
use HWI\Bundle\OAuthBundle\OAuth\Exception\HttpTransportException;
use HWI\Bundle\OAuthBundle\OAuth\RequestDataStorageInterface;
use HWI\Bundle\OAuthBundle\OAuth\ResourceOwner\GenericOAuth2ResourceOwner;
use HWI\Bundle\OAuthBundle\OAuth\Response\PathUserResponse;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\OAuth\State\State;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use HWI\Bundle\OAuthBundle\Security\Helper\NonceGenerator;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\HttpFoundation\Request as HttpRequest;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\HttpUtils;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Diagramme de séquence présentant de manière détaillée les interactions entre
 * l'usager, FranceConnect et le fournisseur de service :
 * https://docs.partenaires.franceconnect.gouv.fr/fs/fs-technique/fs-technique-oidc-flux/#diagramme-de-sequence-franceconnect.
 */
class FranceConnectResourceOwner extends GenericOAuth2ResourceOwner
{
    /**
     * @var array{identifier: string, email: string, firstname: string, lastname: string, nickname: string, birthplace: string}
     */
    protected $paths = [
        'identifier' => 'sub',
        'email' => 'email',
        'firstname' => 'given_name',
        'lastname' => 'family_name',
        'nickname' => 'preferred_username',
        'birthplace' => 'birthplace',
    ];

    public function __construct(
        HttpMethodsClientInterface $hwiHttpClient,
        HttpUtils $httpUtils,
        array $options,
        string $name,
        RequestDataStorageInterface $hwiStorage,
        private readonly RequestStack $requestStack,
        private readonly RedisCache $redisCache,
        private readonly OptionsModifierInterface $optionsModifier,
        private readonly FeatureChecker $featureChecker,
        private readonly TranslatorInterface $translator,
        private readonly LoggerInterface $logger,
        private readonly FranceConnectSSOConfigurationRepository $repository,
        private readonly Jwt $jwt
    ) {
        $this->httpClient = $hwiHttpClient;
        $this->httpUtils = $httpUtils;
        $this->name = $name;
        $this->storage = $hwiStorage;

        $options = $this->optionsModifier->modifyOptions($options, $this);

        if (!empty($options['paths'])) {
            $this->addPaths($options['paths']);
        }
        unset($options['paths']);

        if (!empty($options['options'])) {
            $options += $options['options'];
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
     *
     * @throws InvalidArgumentException
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
            ->getItem(FranceConnectOptionsModifier::REDIS_FRANCE_CONNECT_TOKENS_CACHE_KEY . '-' . $this->requestStack->getSession()->getId())
            ->get()
        ;

        if (!empty($tokens)) {
            $nonce = $tokens['nonce'];

            if (isset($tokens['state'])) {
                $this->state->setCsrfToken($tokens['state']);
            }
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

        $this->handleErrors();

        try {
            $accessToken = parent::getAccessToken($request, $redirectUri, $extraParameters);
        } catch (AuthenticationException $e) {
            $this->requestStack->getSession()->getFlashBag()->add(
                'danger',
                $this->translator->trans('france-connect-error-retrieving-access-token'),
            );

            throw $e;
        }

        return $accessToken;
    }

    public function checkSignature(string $token, FranceConnectSSOConfiguration $fcConfiguration): void
    {
        // Check signature
        // https://docs.partenaires.franceconnect.gouv.fr/fs/migration/fs-migration-diff-v1-v2/#modification-des-algorithmes-de-signature

        if (!$fcConfiguration->isUseV2()) {
            return;
        }

        // Doc for checking signature with JWT:
        // https://github.com/firebase/php-jwt?tab=readme-ov-file#using-cached-key-sets

        // The URI for the JWKS you wish to cache the results from
        $jwksUri = $this->resolveV2Endpoint($fcConfiguration) . '/api/v2/jwks';

        // Create an HTTP client (can be any PSR-7 compatible HTTP client)
        $httpClient = new Client();

        // Create an HTTP request factory (can be any PSR-17 compatible HTTP request factory)
        $httpFactory = new HttpFactory();

        // Create a cache item pool (can be any PSR-6 compatible cache item pool)
        $cacheItemPool = $this->redisCache;

        $keySet = new CachedKeySet(
            $jwksUri,
            $httpClient,
            $httpFactory,
            $cacheItemPool,
            null, // $expiresAfter int seconds to set the JWKS to expire
            true  // $rateLimit    true to enable rate limit of 10 RPS on lookup of invalid keys
        );

        try {
            $this->jwt->decode($token, $keySet);
        } catch (ExpiredException) {
            $this->logger->warning('FranceConnect token expired');
            $errorMessage = $this->translator->trans('france-connect-token-expired');
            $this->requestStack->getSession()->getFlashBag()->add('danger', $errorMessage);

            throw new AuthenticationException('FranceConnect token expired.');
        } catch (SignatureInvalidException) {
            $this->logger->error('FranceConnect signature verification failed');

            throw new AuthenticationException('FranceConnect signature verification failed.');
        } catch (\Throwable $exception) {
            $this->logger->error('FranceConnect token verification failed.', [
                'exception' => $exception,
            ]);

            throw new AuthenticationException('FranceConnect token verification failed.', 0, $exception);
        }
    }

    public function getScope(): string
    {
        $scope = [];

        if ($this->optionsModifier instanceof FranceConnectOptionsModifier) {
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
        } catch (\InvalidArgumentException) {
            throw new AuthenticationException('Given CSRF token is not valid.');
        }
    }

    /**
     * {@inheritdoc}
     *
     * @param array<string, string> $accessToken
     * @param array<string, mixed>  $extraParameters
     *
     * @throws ClientExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ServerExceptionInterface
     *
     * @return PathUserResponse|UserResponseInterface
     */
    public function getUserInformation(array $accessToken, array $extraParameters = [])
    {
        $fcConfiguration = $this->repository->find('franceConnect');

        if (null === $fcConfiguration) {
            throw new AuthenticationException('FranceConnect configuration not found.');
        }

        if (!$fcConfiguration->isUseV2()) {
            return parent::getUserInformation($accessToken, $extraParameters);
        }

        $errorMessage = $this->translator->trans('france-connect-error-retrieving-user-info');

        try {
            $content = $this->httpRequest(
                $this->normalizeUrl($this->options['infos_url'], $extraParameters),
                null,
                ['Authorization' => 'Bearer ' . $accessToken['access_token']]
            );
        } catch (HttpTransportException $e) {
            $this->requestStack->getSession()->getFlashBag()->add('danger', $errorMessage);

            throw new AuthenticationException('Error while retrieving information from FranceConnect.', $e->getCode(), $e);
        }

        if (200 !== $content->getStatusCode()) {
            $this->logger->error('Error at retrieving information from FranceConnect.', [
                'response' => $content,
                'response_code' => $content->getStatusCode(),
                'response_body' => $content->getBody(),
            ]);
            $this->requestStack->getSession()->getFlashBag()->add('danger', $errorMessage);

            throw new AuthenticationException('Error at retrieving information from FranceConnect.');
        }

        $token = $content->getBody();

        $this->checkSignature($token, $fcConfiguration);

        $payloadFromJWT = SecurityJwt::getPayloadFromJWT($token);

        $response = $this->getUserResponse();
        $response->setData($payloadFromJWT);
        $response->setResourceOwner($this);
        $response->setOAuthToken(new OAuthToken($accessToken));

        return $response;
    }

    /**
     * {@inheritdoc}
     */
    public function handles(HttpRequest $request)
    {
        return $request->query->has('code') || $request->query->has('error');
    }

    public function handleErrors(): void
    {
        // https://docs.partenaires.franceconnect.gouv.fr/fs/fs-technique/fs-technique-erreurs/
        $query = $this->requestStack->getCurrentRequest()->query;

        if ($query->has('error')) {
            $errorCode = $query->get('error');

            if ('access_denied' === $errorCode) {
                $message = $this->translator->trans('france-connect-access-denied');
            } elseif (\in_array($errorCode, ['server_error', 'temporarily_unavailable'], true)) {
                $message = $this->translator->trans('france-connect-unavailable');
            } else {
                $message = $this->translator->trans('france-connect-connection-error');
            }
            $this->requestStack->getSession()->getFlashBag()->add('danger', $message);

            throw new FranceConnectAuthenticationException($message);
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

    private function resolveV2Endpoint(FranceConnectSSOConfiguration $fcConfiguration): string
    {
        $configuredUrls = array_filter([
            $fcConfiguration->getAuthorizationUrl(),
            $fcConfiguration->getAccessTokenUrl(),
            $fcConfiguration->getUserInfoUrl(),
            $fcConfiguration->getLogoutUrl(),
        ]);

        foreach (FranceConnectSSOConfiguration::ENDPOINTS_V2 as $endpoint) {
            foreach ($configuredUrls as $configuredUrl) {
                if (str_starts_with($configuredUrl, $endpoint)) {
                    return $endpoint;
                }
            }
        }

        $environment = $fcConfiguration->getEnvironment();

        if (
            \is_string($environment)
            && isset(FranceConnectSSOConfiguration::ENDPOINTS_V2[$environment])
        ) {
            return FranceConnectSSOConfiguration::ENDPOINTS_V2[$environment];
        }

        return FranceConnectSSOConfiguration::ENDPOINTS_V2[EnumSSOEnvironmentType::TESTING];
    }
}
