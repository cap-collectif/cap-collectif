<?php

namespace Capco\Tests\UserBundle\Authenticator;

use Capco\AppBundle\FileSystem\ConfigFileSystem;
use Capco\Tests\IdentityWebTestCase;
use Gaufrette\File;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class MagicLinkAuthenticatorTest extends IdentityWebTestCase
{
    private string $privateKey;

    protected function setUp(): void
    {
        parent::setUp();
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => \OPENSSL_KEYTYPE_RSA]);
        self::assertNotFalse($key);
        openssl_pkey_export($key, $privateKey);
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

    /** @dataProvider tokens */
    public function testSignedLinksAuthenticateOnlyAKnownCurrentIdentityAndCleanTheRedirect(string $kind, string $redirect, ?string $expected): void
    {
        $user = $this->account();
        $id = $user->getId();
        $claims = [
            'email' => \in_array($kind, ['unknown', 'tampered'], true) ? $this->uniqueEmail() : $user->getEmail(),
            'username' => $user->getUsername(),
            'createdAt' => (new \DateTimeImmutable('expired' === $kind ? '2000-01-01' : 'now'))->format('Y-m-d H:i:s'),
            'redirect' => $redirect,
        ];
        $token = \Firebase\JWT\JWT::encode($claims, $this->privateKey, 'RS256');
        if ('tampered' === $kind) {
            [$header, , $signature] = explode('.', $token);
            $claims['email'] = $user->getEmail();
            $payload = rtrim(strtr(base64_encode(json_encode($claims, \JSON_THROW_ON_ERROR)), '+/', '-_'), '=');
            $token = $header . '.' . $payload . '.' . $signature;
        } elseif ('malformed' === $kind) {
            $token = 'malformed-token';
        }
        $this->browser->request('GET', '/magic-link/' . $token);
        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame($expected ?? '/', $this->browser->getResponse()->headers->get('Location'));
        if (null === $expected) {
            self::assertSame(['invalid-token'], $this->browser->getRequest()->getSession()->getFlashBag()->peek('danger'));
        }
        $this->assertViewer(null !== $expected, $id);
        self::assertSame($user->getEmail(), $this->reload($id)->getEmail());
    }

    /** @return iterable<string, array{string, string, ?string}> */
    public static function tokens(): iterable
    {
        yield 'valid link' => ['valid', 'https://capco.test/themes', 'https://capco.test/themes'];
        yield 'expired' => ['expired', 'https://capco.test/themes', null];
        yield 'unknown account' => ['unknown', 'https://capco.test/themes', null];
        yield 'forged email with unchanged signature' => ['tampered', 'https://capco.test/themes', null];
        yield 'malformed token' => ['malformed', 'https://capco.test/themes', null];
        yield 'script in redirect' => ['valid', 'https://capco.test/<script>alert("xss")</script>', 'https://capco.test/'];
    }
}
