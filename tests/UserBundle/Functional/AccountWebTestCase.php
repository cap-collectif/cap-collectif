<?php

declare(strict_types=1);

namespace Capco\Tests\UserBundle\Functional;

use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Mailer\MailerService;
use Capco\Tests\FeatureFlags\FeatureFlagsAwareTest;
use Capco\Tests\FeatureFlags\FeatureFlagsTrait;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

abstract class AccountWebTestCase extends WebTestCase implements FeatureFlagsAwareTest
{
    use FeatureFlagsTrait;

    protected const PASSWORD = 'Account123!';
    protected KernelBrowser $browser;
    protected EntityManagerInterface $em;
    /** @var MailerService&\PHPUnit\Framework\MockObject\MockObject */
    protected MailerService $mailer;
    /** @var list<array{type: string, body: array<string, mixed>}> */
    protected array $messages = [];
    /** @var array<string, true> */
    private array $sessionIds = [];
    /** @var array<string, list<\Monolog\Handler\HandlerInterface>> */
    private array $logHandlers = [];
    private ?string $backchannelEnv = null;
    private ?string $backchannelServer = null;

    protected function setUp(): void
    {
        // This secret is only used by the local test kernel; no SSO request is made.
        $this->backchannelEnv = $_ENV['SYMFONY_OPENID_BACKCHANNEL_SECRET'] ?? null;
        $this->backchannelServer = $_SERVER['SYMFONY_OPENID_BACKCHANNEL_SECRET'] ?? null;
        $_ENV['SYMFONY_OPENID_BACKCHANNEL_SECRET'] ??= 'account-contract-tests';
        $_SERVER['SYMFONY_OPENID_BACKCHANNEL_SECRET'] ??= 'account-contract-tests';
        $this->browser = self::createClient([], [
            'HTTP_HOST' => 'capco.test',
            'HTTPS' => 'on',
            'HTTP_USER_AGENT' => 'Account characterization tests',
        ]);
        $this->browser->disableReboot();
        $container = self::getContainer();
        self::assertSame('test', self::$kernel->getEnvironment(), 'Account tests require the test environment.');
        // Preserve diagnostics without writing into PHPUnit's subprocess protocol.
        $mainHandler = $container->get('monolog.handler.main');
        $fileHandler = new \Monolog\Handler\StreamHandler(self::$kernel->getLogDir() . '/account-contract.log');
        foreach (['logger', 'monolog.logger.request', 'monolog.logger.security', 'monolog.logger.doctrine', 'monolog.logger.php', 'monolog.logger.event'] as $service) {
            if ($container->has($service)) {
                $logger = $container->get($service);
                $handlers = $logger->getHandlers();
                $this->logHandlers[$service] = $handlers;
                $logger->setHandlers(array_map(static fn ($handler) => $handler === $mainHandler ? $fileHandler : $handler, $handlers));
            }
        }
        $this->em = $container->get('doctrine')->getManager();
        $this->em->getConnection()->beginTransaction();
        $listener = $container->get(ElasticsearchDoctrineListener::class);
        $this->em->getEventManager()->removeEventListener($listener->getSubscribedEvents(), $listener);
        $container->set(Indexer::class, $this->createIndexer());
        $this->mailer = $this->createMock(MailerService::class);
        $container->set(MailerService::class, $this->mailer);
        $publisher = $this->createStub(Publisher::class);
        $publisher->method('publish')->willReturnCallback(function (string $type, Message $message): void {
            $this->messages[] = ['type' => $type, 'body' => json_decode((string) $message->getBody(), true, 512, \JSON_THROW_ON_ERROR)];
        });
        $container->set('swarrot.publisher', $publisher);
    }

    protected function tearDown(): void
    {
        try {
            if (isset($this->em)) {
                $connection = $this->em->getConnection();
                $transactionLevel = $connection->getTransactionNestingLevel();
                while ($connection->isTransactionActive()) {
                    $connection->rollBack();
                }
                $this->em->clear();
                self::assertSame(1, $transactionLevel, 'Every request must remain inside the test transaction.');
            }
        } finally {
            try {
                if ($this->sessionIds) {
                    $session = self::getContainer()->get('session');
                    if ($session->isStarted()) {
                        $session->save();
                    }
                    $handler = self::getContainer()->get(\Capco\UserBundle\Security\SessionWithJsonHandler::class);
                    foreach (array_keys($this->sessionIds) as $id) {
                        $handler->destroy($id);
                    }
                }
            } finally {
                foreach ($this->logHandlers as $service => $handlers) {
                    self::getContainer()->get($service)->setHandlers($handlers);
                }
                if (null === $this->backchannelEnv) {
                    unset($_ENV['SYMFONY_OPENID_BACKCHANNEL_SECRET']);
                } else {
                    $_ENV['SYMFONY_OPENID_BACKCHANNEL_SECRET'] = $this->backchannelEnv;
                }
                if (null === $this->backchannelServer) {
                    unset($_SERVER['SYMFONY_OPENID_BACKCHANNEL_SECRET']);
                } else {
                    $_SERVER['SYMFONY_OPENID_BACKCHANNEL_SECRET'] = $this->backchannelServer;
                }
                parent::tearDown();
            }
        }
    }

    public static function featureFlagOverrides(): array
    {
        return ['registration' => true, 'restrict_registration_via_email_domain' => false, 'login_cas' => false, 'login_saml' => false, 'shield_mode' => false];
    }

    protected function createIndexer(): Indexer
    {
        return $this->createStub(Indexer::class);
    }

    /**
     * @param array<string, mixed> $parameters
     * @param array<string, mixed> $files
     * @param array<string, mixed> $server
     */
    protected function request(string $method, string $uri, array $parameters = [], array $files = [], array $server = [], ?string $content = null): void
    {
        try {
            $this->browser->request($method, $uri, $parameters, $files, $server, $content);
            self::assertSame(1, $this->em->getConnection()->getTransactionNestingLevel(), 'Every request must remain inside the test transaction.');
        } finally {
            $request = $this->browser->getRequest();
            if ($request && $request->hasSession() && '' !== $request->getSession()->getId()) {
                $this->sessionIds[$request->getSession()->getId()] = true;
            }
        }
    }

    protected function setFeature(string $feature, bool $enabled): void
    {
        $this->setFeatureFlags([$feature => $enabled]);
    }

    protected function allowRegistrationWithoutCustomResponses(): void
    {
        $form = self::getContainer()->get(\Capco\AppBundle\Repository\RegistrationFormRepository::class)->findCurrent();
        self::assertNotNull($form);
        foreach ($form->getQuestionsArray() as $association) {
            $association->getQuestion()->setRequired(false);
        }
        $this->em->flush();
    }

    protected function uniqueEmail(): string
    {
        return 'account-' . bin2hex(random_bytes(8)) . '@gmail.com';
    }

    protected function account(?string $email = null): User
    {
        $manager = self::getContainer()->get(UserManager::class);
        $user = $manager->createUser();
        self::assertInstanceOf(User::class, $user);
        $user->setEmail($email ?? $this->uniqueEmail());
        $user->setUsername('Account ' . bin2hex(random_bytes(8)));
        $user->setPlainPassword(self::PASSWORD);
        $user->setEnabled(true);
        $user->setConfirmationToken(null);
        $manager->updateUser($user);

        return $user;
    }

    protected function reload(string $id): User
    {
        $this->em->clear();
        $user = $this->em->find(User::class, $id);
        self::assertInstanceOf(User::class, $user);

        return $user;
    }

    /**
     * @param array<string, mixed> $variables
     *
     * @return array<string, mixed>
     */
    protected function graphResponse(string $query, array $variables = []): array
    {
        $this->request('POST', '/graphql/internal', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
        ], json_encode(['query' => $query, 'variables' => $variables], \JSON_THROW_ON_ERROR));
        self::assertSame(200, $this->browser->getResponse()->getStatusCode(), (string) $this->browser->getResponse()->getContent());

        return json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
    }

    /**
     * @param array<string, mixed> $variables
     *
     * @return array<string, mixed>
     */
    protected function graphql(string $query, array $variables = []): array
    {
        $response = $this->graphResponse($query, $variables);
        self::assertArrayNotHasKey('errors', $response, json_encode($response, \JSON_THROW_ON_ERROR));

        self::assertArrayHasKey('data', $response, json_encode($response, \JSON_THROW_ON_ERROR));

        return $response['data'];
    }

    protected function login(string $email, string $password = self::PASSWORD, bool $accepted = true, ?int $status = null, ?bool $sessionAccess = null): void
    {
        $account = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        $this->request('POST', '/login_check', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'username' => $email, 'password' => $password,
        ], \JSON_THROW_ON_ERROR));
        self::assertSame($status ?? ($accepted ? 200 : 401), $this->browser->getResponse()->getStatusCode(), (string) $this->browser->getResponse()->getContent());
        $payload = json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        if (200 === $this->browser->getResponse()->getStatusCode()) {
            self::assertSame($accepted, $payload['success']);
        } else {
            self::assertSame('Bad credentials.', $payload['reason']);
        }
        $this->assertViewer($sessionAccess ?? $accepted, $account ? $account->getId() : null);
    }

    protected function assertViewer(bool $authenticated, ?string $accountId = null): void
    {
        $response = $this->graphResponse('{ viewer { id } }');
        self::assertArrayNotHasKey('errors', $response);
        if ($authenticated) {
            self::assertArrayHasKey('data', $response, json_encode($response, \JSON_THROW_ON_ERROR));
            self::assertNotNull($response['data']['viewer']);
            if (null !== $accountId) {
                self::assertSame(base64_encode('User:' . $accountId), $response['data']['viewer']['id']);
            }
        } else {
            self::assertArrayNotHasKey('data', $response);
            $warnings = $response['extensions']['warnings'] ?? [];
            self::assertNotEmpty($warnings);
            self::assertSame(['viewer'], $warnings[0]['path']);
        }
    }

    protected function logout(): void
    {
        $this->request('GET', '/logout');
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $this->assertViewer(false);
    }
}
