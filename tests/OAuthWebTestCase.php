<?php

declare(strict_types=1);

namespace Capco\Tests;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\SSO\FacebookSSOConfiguration;
use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Capco\UserBundle\Entity\User;
use Firebase\JWT\CachedKeySet;
use Firebase\JWT\JWT;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\HttpFactory;
use GuzzleHttp\Psr7\Response;
use Http\Client\Common\HttpMethodsClient;
use Http\Client\Exception\NetworkException;
use Http\Client\HttpClient;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

abstract class OAuthWebTestCase extends IdentityWebTestCase
{
    protected const JWT_NOW = 1791280800;
    protected string $providerSubject;
    /** @var list<string> */
    protected array $unlinkedProviderEmails = [];
    protected ?RedisCache $providerCache = null;
    protected bool $franceConnectV2 = false;
    protected string $signingKey = '';
    /** @var array<string, array<string, mixed>|string> */
    protected array $providerResponses = [];
    protected ?string $transportFailurePath = null;
    private ?int $originalJwtTimestamp = null;
    private string|false $originalInstance = false;
    private ?string $originalInstanceEnv = null;
    private ?string $originalInstanceServer = null;
    private ?string $originalCacheNamespaceEnv = null;
    private ?string $originalCacheNamespaceServer = null;

    protected function setUp(): void
    {
        $this->originalInstance = getenv('SYMFONY_INSTANCE_NAME');
        $this->originalInstanceEnv = $_ENV['SYMFONY_INSTANCE_NAME'] ?? null;
        $this->originalInstanceServer = $_SERVER['SYMFONY_INSTANCE_NAME'] ?? null;
        // Instance-specific scenarios select their configuration before any service is constructed.
        $instance = $this->getProvidedData()['instance'] ?? 'dev';
        putenv('SYMFONY_INSTANCE_NAME=' . $instance);
        $_ENV['SYMFONY_INSTANCE_NAME'] = $_SERVER['SYMFONY_INSTANCE_NAME'] = $instance;
        $this->providerSubject = 'provider-' . bin2hex(random_bytes(8));
        $this->originalJwtTimestamp = JWT::$timestamp;
        JWT::$timestamp = self::JWT_NOW;
        $this->originalCacheNamespaceEnv = $_ENV['CAPCO_TEST_PROVIDER_CACHE_NAMESPACE'] ?? null;
        $this->originalCacheNamespaceServer = $_SERVER['CAPCO_TEST_PROVIDER_CACHE_NAMESPACE'] ?? null;
        $_ENV['CAPCO_TEST_PROVIDER_CACHE_NAMESPACE'] = $_SERVER['CAPCO_TEST_PROVIDER_CACHE_NAMESPACE'] = 'sso-contract-' . bin2hex(random_bytes(8));
        parent::setUp();
        // Real Redis, isolated from shared provider configuration and state caches.
        $cache = self::getContainer()->get(RedisCache::class);
        self::assertInstanceOf(RedisCache::class, $cache);
        $this->providerCache = $cache;
        $transport = $this->createStub(HttpClient::class);
        $transport->method('sendRequest')->willReturnCallback(function (RequestInterface $request): ResponseInterface {
            $path = $request->getUri()->getPath();
            if ($path === $this->transportFailurePath) {
                throw new NetworkException('Provider transport unavailable', $request);
            }
            if (!isset($this->providerResponses[$path])) {
                throw new \RuntimeException('Unexpected provider request: ' . $request->getMethod() . ' ' . $request->getUri());
            }

            return new Response(200, ['Content-Type' => 'application/json'], \is_string($this->providerResponses[$path]) ? $this->providerResponses[$path] : json_encode($this->providerResponses[$path], \JSON_THROW_ON_ERROR));
        });
        $factory = new HttpFactory();
        self::getContainer()->set('hwi_oauth.http_client', new HttpMethodsClient($transport, $factory, $factory));
        foreach (['openid', 'facebook', 'franceconnect'] as $provider) {
            $this->setFeature('login_' . $provider, false);
        }
    }

    protected function tearDown(): void
    {
        try {
            if (isset($this->em)) {
                // Provider-created accounts can have no email or reuse an existing account.
                foreach (['openId', 'facebook_id', 'franceConnectId'] as $identityField) {
                    foreach ($this->em->getRepository(User::class)->findBy([$identityField => $this->providerSubject]) as $account) {
                        self::getContainer()->get('snc_redis.default')->srem('recalculate_user_counters', [$account->getId()]);
                    }
                }
            }
            if (isset($this->em)) {
                foreach ($this->unlinkedProviderEmails as $email) {
                    foreach ($this->em->getRepository(User::class)->findBy(['email' => $email]) as $account) {
                        self::getContainer()->get('snc_redis.default')->srem('recalculate_user_counters', [$account->getId()]);
                    }
                }
            }
            $this->providerCache?->clear();
        } finally {
            try {
                parent::tearDown();
            } finally {
                JWT::$timestamp = $this->originalJwtTimestamp;
                if (null === $this->originalCacheNamespaceEnv) {
                    unset($_ENV['CAPCO_TEST_PROVIDER_CACHE_NAMESPACE']);
                } else {
                    $_ENV['CAPCO_TEST_PROVIDER_CACHE_NAMESPACE'] = $this->originalCacheNamespaceEnv;
                }
                if (null === $this->originalCacheNamespaceServer) {
                    unset($_SERVER['CAPCO_TEST_PROVIDER_CACHE_NAMESPACE']);
                } else {
                    $_SERVER['CAPCO_TEST_PROVIDER_CACHE_NAMESPACE'] = $this->originalCacheNamespaceServer;
                }
                putenv(false === $this->originalInstance ? 'SYMFONY_INSTANCE_NAME' : 'SYMFONY_INSTANCE_NAME=' . $this->originalInstance);
                if (null === $this->originalInstanceEnv) {
                    unset($_ENV['SYMFONY_INSTANCE_NAME']);
                } else {
                    $_ENV['SYMFONY_INSTANCE_NAME'] = $this->originalInstanceEnv;
                }
                if (null === $this->originalInstanceServer) {
                    unset($_SERVER['SYMFONY_INSTANCE_NAME']);
                } else {
                    $_SERVER['SYMFONY_INSTANCE_NAME'] = $this->originalInstanceServer;
                }
            }
        }
    }

    /** @param array<string, mixed> $claims */
    protected function signedClaims(array $claims, ?int $expiration = null): string
    {
        return JWT::encode($claims + ['exp' => $expiration ?? self::JWT_NOW + 3600], $this->signingKey, 'RS256', 'contract-key');
    }

    /** @return list<string> */
    protected function groupTitles(User $account): array
    {
        $titles = [];
        foreach ($account->getUserGroups() as $membership) {
            $titles[] = $membership->getGroup()->getTitle();
        }
        sort($titles);

        return $titles;
    }

    protected function configureProvider(string $provider, string $email, bool $v2 = false): void
    {
        $this->setFeature('login_' . $provider, true);
        $claims = ['sub' => $this->providerSubject, 'id' => $this->providerSubject, 'email' => $email, 'given_name' => 'Provider', 'family_name' => 'Person', 'name' => 'Provider Person', 'first_name' => 'Provider', 'last_name' => 'Person', 'preferred_username' => 'Provider Person'];
        $this->providerResponses['/openid/token'] = ['access_token' => 'provider-access-token'];
        $this->providerResponses['/openid/userinfo'] = $claims;
        $this->providerResponses['/v8.0/oauth/access_token'] = ['access_token' => 'provider-access-token'];
        $this->providerResponses['/v8.0/me'] = $claims;
        $this->providerResponses['/franceconnect/token'] = ['access_token' => 'provider-access-token'];
        $this->providerResponses['/franceconnect/userinfo'] = $claims;
        $configuration = match ($provider) {
            'openid' => $this->em->getRepository(Oauth2SSOConfiguration::class)->findOneBy([]),
            'facebook' => $this->em->getRepository(FacebookSSOConfiguration::class)->findOneBy([]),
            'franceconnect' => $this->em->getRepository(FranceConnectSSOConfiguration::class)->find('franceConnect'),
            default => throw new \InvalidArgumentException('Unknown provider'),
        };
        self::assertNotNull($configuration);
        $configuration->setEnabled(true)->setClientId('test-client')->setSecret('test-secret');
        if ('facebook' !== $provider) {
            $configuration->setAuthorizationUrl('https://provider.test/' . $provider . '/authorize');
            $configuration->setAccessTokenUrl('https://provider.test/' . $provider . '/token');
            $configuration->setUserInfoUrl('https://provider.test/' . $provider . '/userinfo');
            $configuration->setLogoutUrl('https://provider.test/' . $provider . '/logout');
        }
        if ($configuration instanceof FranceConnectSSOConfiguration) {
            $configuration->setUseV2($v2)->setEnvironment('TESTING');
            $this->franceConnectV2 = $v2;
            if ($v2) {
                $this->prepareFranceConnectSigningKey();
                $configuration->setAuthorizationUrl('https://fcp-low.sbx.dev-franceconnect.fr/api/v2/authorize');
                $configuration->setAccessTokenUrl('https://fcp-low.sbx.dev-franceconnect.fr/api/v2/token');
                $configuration->setUserInfoUrl('https://fcp-low.sbx.dev-franceconnect.fr/api/v2/userinfo');
                $configuration->setLogoutUrl('https://fcp-low.sbx.dev-franceconnect.fr/api/v2/session/end');
                $this->providerResponses['/api/v2/token'] = ['access_token' => 'provider-access-token'];
                $this->providerResponses['/api/v2/userinfo'] = $this->signedClaims($claims);
            }
            $configuration->setAllowedData(['given_name' => true, 'family_name' => true, 'email' => true, 'preferred_username' => true]);
        }
        $this->em->flush();
    }

    /** @return array<string, string> */
    protected function beginLogin(string $provider, bool $association = false): array
    {
        $this->browser->request('GET', '/login/' . $provider . '?_destination=/projects');
        self::assertSame(302, $this->browser->getResponse()->getStatusCode(), (string) $this->browser->getResponse()->getContent());
        $uri = (string) $this->browser->getResponse()->headers->get('Location');
        self::assertSame($this->franceConnectV2 ? 'fcp-low.sbx.dev-franceconnect.fr' : ('facebook' === $provider ? 'www.facebook.com' : 'provider.test'), parse_url($uri, \PHP_URL_HOST));
        // @var array<string, string> $parameters
        parse_str((string) parse_url($uri, \PHP_URL_QUERY), $parameters);
        self::assertSame('test-client', $parameters['client_id']);
        self::assertSame('https://capco.test/login/' . ($association ? 'service/' : 'check-') . $provider, $parameters['redirect_uri']);

        $state = $parameters['state'] ?? '';
        $nonce = $parameters['nonce'] ?? '';
        self::assertIsString($state);
        self::assertIsString($nonce);

        return ['state' => $state, 'nonce' => $nonce];
    }

    protected function setProviderNonce(string $nonce): void
    {
        // FranceConnect v1 exposes a decoded JWT nonce, without signature validation.
        $token = base64_encode('{"alg":"none"}') . '.' . base64_encode(json_encode(['nonce' => $nonce], \JSON_THROW_ON_ERROR)) . '.fixture';
        $this->providerResponses[$this->franceConnectV2 ? '/api/v2/token' : '/franceconnect/token']['id_token'] = $this->franceConnectV2 ? $this->signedClaims(['nonce' => $nonce]) : $token;
    }

    private function prepareFranceConnectSigningKey(): void
    {
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => \OPENSSL_KEYTYPE_RSA]);
        self::assertNotFalse($key);
        openssl_pkey_export($key, $this->signingKey);
        $details = openssl_pkey_get_details($key);
        self::assertNotFalse($details);
        $jwk = ['kty' => 'RSA', 'kid' => 'contract-key', 'alg' => 'RS256', 'n' => JWT::urlsafeB64Encode($details['rsa']['n']), 'e' => JWT::urlsafeB64Encode($details['rsa']['e'])];
        // Seed the isolated JWKS cache through the library's public API, using a fixed provider response.
        $http = new Client(['handler' => HandlerStack::create(new MockHandler([new Response(200, [], json_encode(['keys' => [$jwk]], \JSON_THROW_ON_ERROR))]))]);
        $keys = new CachedKeySet('https://fcp-low.sbx.dev-franceconnect.fr/api/v2/jwks', $http, new HttpFactory(), $this->providerCache);
        self::assertInstanceOf(\Firebase\JWT\Key::class, $keys['contract-key']);
    }
}
