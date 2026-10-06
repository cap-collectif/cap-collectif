<?php

declare(strict_types=1);

namespace Capco\Tests;

use Capco\UserBundle\Authenticator\SamlAuthenticator;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Security\Core\User\SamlUserProvider;
use Psr\Log\LoggerInterface;
use SimpleSAML\Auth\Simple;

abstract class SamlWebTestCase extends IdentityWebTestCase
{
    protected ?string $samlIdentifier = null;
    /** @var array<string, array{process: string|false, env: ?string, server: ?string}> */
    private array $samlEnvironment = [];

    protected function setUp(): void
    {
        foreach (['SYMFONY_LOGIN_SAML_ALLOWED' => 'true', 'SYMFONY_SAML_SP' => 'dev'] as $key => $value) {
            $this->samlEnvironment[$key] = ['process' => getenv($key), 'env' => $_ENV[$key] ?? null, 'server' => $_SERVER[$key] ?? null];
            putenv($key . '=' . $value);
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
        parent::setUp();
    }

    protected function tearDown(): void
    {
        try {
            // Accounts created by SSO are not registered by the account preparation helper.
            if (null !== $this->samlIdentifier) {
                $account = $this->em->getRepository(User::class)->findOneBy(['samlId' => $this->samlIdentifier]);
                if (null !== $account) {
                    self::getContainer()->get('snc_redis.default')->srem('recalculate_user_counters', [$account->getId()]);
                }
            }
        } finally {
            try {
                parent::tearDown();
            } finally {
                foreach ($this->samlEnvironment as $key => $original) {
                    putenv(false === $original['process'] ? $key : $key . '=' . $original['process']);
                    if (null === $original['env']) {
                        unset($_ENV[$key]);
                    } else {
                        $_ENV[$key] = $original['env'];
                    }
                    if (null === $original['server']) {
                        unset($_SERVER[$key]);
                    } else {
                        $_SERVER[$key] = $original['server'];
                    }
                }
            }
        }
    }

    /** @param array<string, mixed> $options */
    protected static function createKernel(array $options = []): SamlTestKernel
    {
        return new SamlTestKernel('test', true);
    }

    /** @param array<string, list<string>> $attributes */
    protected function configureSaml(array $attributes, string $idp = 'dev'): void
    {
        $client = $this->createStub(Simple::class);
        $client->method('isAuthenticated')->willReturn(true);
        $client->method('getAttributes')->willReturn($attributes);
        $this->setSamlClient($client, $idp);
    }

    protected function setSamlClient(Simple $client, string $idp = 'dev'): void
    {
        $container = self::getContainer();
        $container->set(Simple::class, $client);
        $logger = $container->get('logger');
        self::assertInstanceOf(LoggerInterface::class, $logger);
        $provider = $container->get(SamlUserProvider::class);
        self::assertInstanceOf(SamlUserProvider::class, $provider);
        // Configure the real authenticator with the scenario's IdP, without changing the shared kernel cache.
        $container->set(SamlAuthenticator::class, new SamlAuthenticator($client, $idp, $logger, $provider));
        $this->setFeature('login_saml', true);
    }
}
