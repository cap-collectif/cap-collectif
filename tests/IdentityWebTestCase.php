<?php

declare(strict_types=1);

namespace Capco\Tests;

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

abstract class IdentityWebTestCase extends WebTestCase implements FeatureFlagsAwareTest
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
    /** @var list<string> */
    private array $createdAccountIds = [];
    private ?Indexer $searchIndexer = null;
    /** @var list<array{class-string, string}> */
    private array $indexedEntities = [];
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
        // Expected authentication failures must not write to subprocess stderr.
        $container->get('monolog.handler.main')->setLevel(\Monolog\Logger::EMERGENCY);
        self::assertSame('test', $container->getParameter('kernel.environment'));
        $container->get('event_dispatcher')->addListener(\Symfony\Component\HttpKernel\KernelEvents::RESPONSE, function (\Symfony\Component\HttpKernel\Event\ResponseEvent $event): void {
            $request = $event->getRequest();
            if ($request->hasSession() && '' !== ($id = $request->getSession()->getId())) {
                $this->sessionIds[$id] = true;
            }
        });
        $this->em = $container->get('doctrine')->getManager();
        $this->em->getConnection()->beginTransaction();
        $listener = $container->get(ElasticsearchDoctrineListener::class);
        $this->em->getEventManager()->removeEventListener($listener->getSubscribedEvents(), $listener);
        $container->set(Indexer::class, $this->createStub(Indexer::class));
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
        $transactionLevel = null;

        try {
            try {
                if (isset($this->em)) {
                    $connection = $this->em->getConnection();
                    $transactionLevel = $connection->getTransactionNestingLevel();
                    while ($connection->isTransactionActive()) {
                        $connection->rollBack();
                    }
                    $this->em->clear();
                }
            } finally {
                try {
                    foreach ($this->indexedEntities as [$class, $id]) {
                        $this->searchIndexer->remove($class, $id);
                    }
                    if ($this->indexedEntities) {
                        $this->searchIndexer->finishBulk();
                    }
                } finally {
                    // Preparation can save a session before the first HTTP response,
                    // including when an assertion fails immediately after loginUser().
                    if (isset($this->browser)) {
                        /** @var \Symfony\Component\HttpFoundation\Session\SessionInterface $session */
                        $session = self::getContainer()->get('session');
                        if ('' !== $session->getId()) {
                            $this->sessionIds[$session->getId()] = true;
                        }
                        foreach ($this->browser->getCookieJar()->all() as $cookie) {
                            if ($cookie->getName() === $session->getName() && '' !== $cookie->getValue()) {
                                $this->sessionIds[$cookie->getValue()] = true;
                            }
                        }
                    }
                    if ($this->sessionIds) {
                        $handler = self::getContainer()->get(\Capco\UserBundle\Security\SessionWithJsonHandler::class);
                        foreach (array_keys($this->sessionIds) as $id) {
                            $handler->destroy($id);
                        }
                    }
                }
            }
            if (null !== $transactionLevel) {
                self::assertSame(1, $transactionLevel, 'Every request must remain inside the test transaction.');
            }
        } finally {
            try {
                // SQL rollback does not remove counter recalculations queued in Redis.
                // Remove only accounts created by this test, preserving all other members.
                if ($this->createdAccountIds) {
                    self::getContainer()->get('snc_redis.default')->srem('recalculate_user_counters', $this->createdAccountIds);
                }
            } finally {
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

    /**
     * Prepare search data only; this does not test application-triggered indexation.
     * SQL is rolled back and these documents are removed even after a failed assertion.
     *
     * @param class-string $class
     */
    protected function indexForSearch(string $class, string $id): void
    {
        if (null === $this->searchIndexer) {
            $indexer = self::getContainer()->get('test.identity_search_indexer');
            self::assertInstanceOf(Indexer::class, $indexer);
            $this->searchIndexer = $indexer;
        }
        $this->indexedEntities[] = [$class, $id];
        $this->searchIndexer->index($class, $id);
        $this->searchIndexer->finishBulk();
    }

    protected function setFeature(string $feature, bool $enabled): void
    {
        $this->setFeatureFlags([$feature => $enabled]);
    }

    /**
     * Exercise provider/rate-limit behavior skipped by the production test-environment branch.
     * Only this service captures the environment stub; the HTTP kernel remains in test mode.
     *
     * @param class-string $service
     */
    protected function useProviderEnvironment(string $service): void
    {
        $container = self::getContainer();
        $kernel = $container->get('kernel');
        $providerKernel = $this->createStub(\Symfony\Component\HttpKernel\KernelInterface::class);
        $providerKernel->method('getEnvironment')->willReturn('prod');
        $container->set('kernel', $providerKernel);

        try {
            $container->get($service);
        } finally {
            $container->set('kernel', $kernel);
        }
    }

    protected function configureRegistrationQuestions(): void
    {
        $form = self::getContainer()->get(\Capco\AppBundle\Repository\RegistrationFormRepository::class)->findCurrent();
        self::assertNotNull($form);
        foreach ($form->getQuestionsArray() as $association) {
            $association->getQuestion()->setRequired(false);
        }
        $this->em->flush();
    }

    /** @return array<string, mixed> */
    protected function register(string $email, ?string $invitationToken = null): array
    {
        $this->configureRegistrationQuestions();
        $input = ['email' => $email, 'username' => 'New account', 'plainPassword' => self::PASSWORD, 'responses' => [], 'captcha' => 'test'];
        if (null !== $invitationToken) {
            $input['invitationToken'] = $invitationToken;
        }

        return $this->graphql('mutation($input: RegisterInput!) { register(input: $input) { user { id } errorsCode } }', ['input' => $input])['register'];
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
        $this->createdAccountIds[] = $user->getId();

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
        $this->browser->request('POST', '/graphql/internal', [], [], [
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
        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        $this->browser->request('POST', '/login_check', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'username' => $email, 'password' => $password,
        ], \JSON_THROW_ON_ERROR));
        self::assertSame($status ?? ($accepted ? 200 : 401), $this->browser->getResponse()->getStatusCode(), (string) $this->browser->getResponse()->getContent());
        $payload = json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        if (200 === $this->browser->getResponse()->getStatusCode()) {
            self::assertSame($accepted, $payload['success']);
        } else {
            self::assertNotEmpty($payload['reason']);
        }
        $this->assertViewer($sessionAccess ?? $accepted, $user?->getId());
    }

    protected function assertViewer(bool $authenticated, ?string $userId = null): void
    {
        $response = $this->graphResponse('{ viewer { id } }');
        self::assertArrayNotHasKey('errors', $response);
        if ($authenticated) {
            self::assertArrayHasKey('data', $response, json_encode($response, \JSON_THROW_ON_ERROR));
            self::assertNotNull($response['data']['viewer']);
            if (null !== $userId) {
                self::assertSame(\Overblog\GraphQLBundle\Relay\Node\GlobalId::toGlobalId('User', $userId), $response['data']['viewer']['id']);
            }
        } else {
            self::assertEmpty($response['data']['viewer'] ?? null);
            $warnings = $response['extensions']['warnings'] ?? [];
            self::assertNotEmpty($warnings);
            self::assertSame(['viewer'], $warnings[0]['path']);
        }
    }

    protected function logout(): void
    {
        $this->browser->request('GET', '/logout');
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $this->assertViewer(false);
    }
}
