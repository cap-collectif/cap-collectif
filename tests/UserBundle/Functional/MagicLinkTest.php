<?php

declare(strict_types=1);

namespace Capco\Tests\UserBundle\Functional;

use Capco\AppBundle\FileSystem\ConfigFileSystem;
use Capco\UserBundle\Entity\User;
use Firebase\JWT\JWT;
use Gaufrette\File;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Exercises account contracts through HTTP with fresh database reads, transactional cleanup and external boundary doubles.
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
final class MagicLinkTest extends AccountWebTestCase
{
    private const SEND = 'mutation($input: SendMagicLinkEmailInput!) { sendMagicLinkEmail(input: $input) { errorCode } }';
    private string $privateKey;

    protected function setUp(): void
    {
        parent::setUp();
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => \OPENSSL_KEYTYPE_RSA]);
        self::assertNotFalse($key);
        self::assertTrue(openssl_pkey_export($key, $privateKey));
        $this->privateKey = $privateKey;
        $details = openssl_pkey_get_details($key);
        self::assertNotFalse($details);
        $filesystem = $this->createStub(ConfigFileSystem::class);
        $filesystem->method('get')->willReturnCallback(function (string $path) use ($details): File {
            $file = $this->createStub(File::class);
            $file->method('getContent')->willReturn(str_ends_with($path, 'private.pem') ? $this->privateKey : $details['key']);

            return $file;
        });
        self::getContainer()->set(ConfigFileSystem::class, $filesystem);
    }

    public function testCharacterizationGapRequestedMagicLinkAuthenticatesAndRemainsReplayable(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $result = $this->send($user->getEmail());
        self::assertNull($result['errorCode']);
        self::assertCount(1, $this->messages);
        $url = $this->messages[0]['body']['magicLinkUrl'];
        self::assertNotNull($this->reload($id)->getMagicLinkSentAt());
        $this->request('GET', $url);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        self::assertSame('https://capco.test/themes', $this->browser->getResponse()->headers->get('Location'));
        $this->assertViewer(true, $id);
        $this->logout();
        $this->request('GET', $url);
        $this->assertViewer(true, $id);
    }

    public function testRepeatedMagicLinkRequestReturnsRateLimitErrorWithoutOutboundEffects(): void
    {
        // Exercise the real limiter outside its deliberate test-environment bypass.
        $pool = new \Symfony\Component\Cache\Adapter\ArrayAdapter();
        $cache = $this->createStub(\Capco\AppBundle\Cache\RedisCache::class);
        $cache->method('getItem')->willReturnCallback($pool->getItem(...));
        $cache->method('save')->willReturnCallback($pool->save(...));
        $kernel = $this->createStub(\Symfony\Component\HttpKernel\KernelInterface::class);
        $kernel->method('getEnvironment')->willReturn('prod');
        self::getContainer()->set(\Capco\AppBundle\Service\EmailRateLimiter::class, new \Capco\AppBundle\Service\EmailRateLimiter($cache, new \Psr\Log\NullLogger(), $kernel));
        $user = $this->account();
        $id = $user->getId();
        $email = $user->getEmail();
        self::assertNull($this->send($email)['errorCode']);
        self::assertCount(1, $this->messages);
        $sentAt = $this->reload($id)->getMagicLinkSentAt();
        self::assertNotNull($sentAt);
        self::assertSame('EMAIL_RECENTLY_SENT', $this->send($email)['errorCode']);
        self::assertCount(1, $this->messages);
        self::assertEquals($sentAt, $this->reload($id)->getMagicLinkSentAt());
        $this->assertViewer(false);
    }

    public function testUnknownEmailReturnsSuccessWithoutPublishingOrCreatingAnAccount(): void
    {
        $email = $this->uniqueEmail();
        self::assertNull($this->send($email)['errorCode']);
        self::assertSame([], $this->messages);
        $this->em->clear();
        self::assertNull($this->em->getRepository(User::class)->findOneBy(['email' => $email]));
    }

    public function testAnonymizedAccountCannotUseAnExistingMagicLink(): void
    {
        $user = $this->account();
        $token = $this->token($user->getEmail());
        self::getContainer()->get(\Capco\AppBundle\Anonymizer\UserAnonymizer::class)->anonymize($user);
        $this->request('GET', '/magic-link/' . $token);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $this->assertViewer(false);
    }

    /** @dataProvider invalidTokens */
    public function testRejectsInvalidMagicLinkWithoutAuthenticating(string $kind): void
    {
        $user = $this->account();
        $id = $user->getId();
        $hash = $user->getPassword();
        $email = 'unknown' === $kind ? $this->uniqueEmail() : $user->getEmail();
        $token = $this->token($email, 'expired' === $kind ? '2000-01-01 00:00:00' : 'now');
        if ('signature' === $kind) {
            $parts = explode('.', $token);
            $parts[2] = str_repeat('a', \strlen($parts[2]));
            $token = implode('.', $parts);
        }
        $this->request('GET', '/magic-link/' . $token);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $this->assertViewer(false);
        $user = $this->reload($id);
        self::assertSame($hash, $user->getPassword());
        self::assertNull($user->getMagicLinkSentAt());
        self::assertSame([], $this->messages);
    }

    /** @return iterable<string, array{string}> */
    public static function invalidTokens(): iterable
    {
        yield 'expired' => ['expired'];
        yield 'invalid signature' => ['signature'];
        yield 'unknown account' => ['unknown'];
    }

    /** @dataProvider accountStates */
    public function testCharacterizationGapMagicLinkBypassesAccountStatusChecks(string $state): void
    {
        $user = $this->account();
        $id = $user->getId();
        if ('disabled' === $state) {
            $user->setEnabled(false);
        } elseif ('locked' === $state) {
            $user->setLocked(true);
        } elseif ('unconfirmed' === $state) {
            $user->setConfirmationToken(str_repeat('a', 43));
        } elseif ('deleted' === $state) {
            $user->setDeletedAccountAt(new \DateTime());
        }
        $this->em->flush();
        $this->request('GET', '/magic-link/' . $this->token($user->getEmail()));
        self::assertSame('https://capco.test/themes', $this->browser->getResponse()->headers->get('Location'));
        // Session refresh rejects deleted identities on the next request.
        $this->assertViewer('deleted' !== $state, $id);
    }

    /** @return iterable<string, array{string}> */
    public static function accountStates(): iterable
    {
        yield 'disabled' => ['disabled'];
        yield 'locked' => ['locked'];
        yield 'unconfirmed' => ['unconfirmed'];
        yield 'deleted marker' => ['deleted'];
    }

    /** @return array<string, mixed> */
    private function send(string $email): array
    {
        return $this->graphql(self::SEND, ['input' => ['email' => $email, 'redirectUrl' => 'https://capco.test/themes']])['sendMagicLinkEmail'];
    }

    private function token(string $email, string $date = 'now'): string
    {
        return JWT::encode([
            'email' => $email, 'username' => 'Account',
            'createdAt' => (new \DateTimeImmutable($date))->format('Y-m-d H:i:s'),
            'redirect' => 'https://capco.test/themes',
        ], $this->privateKey, 'RS256');
    }
}
