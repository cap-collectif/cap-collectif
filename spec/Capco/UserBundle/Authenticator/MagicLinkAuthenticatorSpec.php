<?php

declare(strict_types=1);

namespace spec\Capco\UserBundle\Authenticator;

use Capco\AppBundle\FileSystem\ConfigFileSystem;
use Capco\UserBundle\Authenticator\Exception\InvalidTokenException;
use Capco\UserBundle\Authenticator\MagicLinkAuthenticator;
use Capco\UserBundle\Security\Core\User\UserEmailProvider;
use DateTimeImmutable;
use Firebase\JWT\JWT;
use FOS\UserBundle\Model\UserInterface;
use Gaufrette\File;
use PhpSpec\ObjectBehavior;
use PHPUnit\Framework\MockObject\RuntimeException;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

class MagicLinkAuthenticatorSpec extends ObjectBehavior
{
    private const CREATED_AT_OUT_OF_DATE = 'out_of_date';
    private const CREATED_AT_IN_DATE = 'in_date';

    private string $passPhrase = 'capco';

    public function let(
        UserEmailProvider $userProvider,
        ConfigFileSystem $filesystem
    ): void {
        $this->beConstructedWith(
            $userProvider,
            $filesystem
        );
        $this->generateTemporaryKeyPair();
    }

    public function letGo(): void
    {
        unlink('/tmp/private.pem');
        unlink('/tmp/public.pem');
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(MagicLinkAuthenticator::class);
    }

    public function it_throws_an_exception_when_token_is_out_of_date(
        ConfigFileSystem $filesystem,
        File $file,
        UserEmailProvider $userProvider,
        UserInterface $user
    ): void {
        $this->mockPublicKey($filesystem, $file);

        $outOfDateCreation = $this->getCreationDateString(self::CREATED_AT_OUT_OF_DATE);
        $user->getUsername()->willReturn('user5');
        $user->getRoles()->willReturn(['ROLE_USER']);
        $userProvider->findUser('user@test.com')->willReturn($user);

        $token = $this->generateToken(
            'user5',
            'user@test.com',
            $outOfDateCreation,
            'https://capco.dev/',
        );

        $this->shouldThrow(new InvalidTokenException('Token is out of date'))->during('authenticateToken', [$token]);
    }

    public function it_throws_an_exception_when_email_is_not_valid(
        ConfigFileSystem $filesystem,
        File $file,
        UserEmailProvider $userProvider,
        UserInterface $user
    ): void {
        $this->mockPublicKey($filesystem, $file);
        $createdAt = $this->getCreationDateString(self::CREATED_AT_IN_DATE);
        $userProvider->findUser('invalid_email')->willReturn(null);

        $token = $this->generateToken(
            'user5',
            'invalid_email',
            $createdAt,
            'https://capco.dev/',
        );

        $this->shouldThrow(new InvalidTokenException('User not found'))->during('authenticateToken', [$token]);
    }

    public function it_returns_a_valid_token(
        ConfigFileSystem $filesystem,
        File $file,
        UserEmailProvider $userProvider,
        UserInterface $user
    ): void {
        $this->mockPublicKey($filesystem, $file);
        $createdAt = $this->getCreationDateString(self::CREATED_AT_IN_DATE);
        $user->getUsername()->willReturn('user5');
        $user->getRoles()->willReturn(['ROLE_USER']);
        $user->getPassword()->willReturn('password');
        $userProvider->findUser('user@test.com')->willReturn($user);

        $token = $this->generateToken(
            'user5',
            'user@test.com',
            $createdAt,
            'https://capco.dev/',
        );

        $this->authenticateToken($token)->shouldBeAnInstanceOf(UsernamePasswordToken::class);
    }

    public function it_stores_redirect_url_and_it_can_provide_it_later(
        ConfigFileSystem $filesystem,
        File $file,
        UserEmailProvider $userProvider,
        UserInterface $user
    ): void {
        $this->mockPublicKey($filesystem, $file);
        $createdAt = $this->getCreationDateString(self::CREATED_AT_IN_DATE);
        $user->getUsername()->willReturn('user5');
        $user->getRoles()->willReturn(['ROLE_USER']);
        $user->getPassword()->willReturn('password');
        $userProvider->findUser('user@test.com')->willReturn($user);

        $token = $this->generateToken(
            'user5',
            'user@test.com',
            $createdAt,
            'https://capco.dev/themes',
        );

        $this->authenticateToken($token);
        $this->getRedirectUrl()->shouldReturn('https://capco.dev/themes');
    }

    public function it_prevents_from_xss_in_provided_url(
        ConfigFileSystem $filesystem,
        File $file,
        UserEmailProvider $userProvider,
        UserInterface $user
    ): void {
        $this->mockPublicKey($filesystem, $file);
        $createdAt = $this->getCreationDateString(self::CREATED_AT_IN_DATE);
        $user->getUsername()->willReturn('user5');
        $user->getRoles()->willReturn(['ROLE_USER']);
        $user->getPassword()->willReturn('password');
        $userProvider->findUser('user@test.com')->willReturn($user);

        $token = $this->generateToken(
            'user5',
            'user@test.com',
            $createdAt,
            'https://capco.dev/<script>alert("xss")</script>',
        );

        $this->authenticateToken($token);
        $this->getRedirectUrl()->shouldReturn('https://capco.dev/');
    }

    private function generateToken(
        string $username,
        string $email,
        string $createdAt,
        string $redirect
    ): string {
        $payload = [
            'username' => $username,
            'email' => $email,
            'createdAt' => $createdAt,
            'redirect' => $redirect,
        ];

        $privateKey = file_get_contents('/tmp/private.pem');
        $privateKey = openssl_pkey_get_private($privateKey, $this->passPhrase);
        if (false === $privateKey) {
            throw new RuntimeException('Private key could not be loaded');
        }

        return JWT::encode($payload, $privateKey, 'RS256');
    }

    private function mockPublicKey(ConfigFileSystem $filesystem, File $file): void
    {
        $publicKeyContent = file_get_contents('/tmp/public.pem');
        $file->getContent()->willReturn($publicKeyContent);
        $filesystem->get(MagicLinkAuthenticator::TOKEN_CONFIG_FOLDER . '/public.pem')->willReturn($file);
    }

    private function getCreationDateString(string $createdAtEnum): string
    {
        switch ($createdAtEnum) {
            case self::CREATED_AT_IN_DATE:
                return (new DateTimeImmutable('now -3 minutes'))->format('Y-m-d H:i:s');

            case self::CREATED_AT_OUT_OF_DATE:
                return (new DateTimeImmutable('1980-01-01'))->format('Y-m-d H:i:s');

            default:
                return (new DateTimeImmutable('now'))->format('Y-m-d H:i:s');
        }
    }

    private function generateTemporaryKeyPair(): void
    {
        $privateKey = openssl_pkey_new([
            'digest_alg' => 'sha256',
            'private_key_bits' => 2048,
            'private_key_type' => \OPENSSL_KEYTYPE_RSA,
        ]);

        openssl_pkey_export($privateKey, $privateKeyString);

        $publicKey = openssl_pkey_get_details($privateKey);
        $publicKeyString = $publicKey['key'];

        file_put_contents('/tmp/private.pem', $privateKeyString);
        file_put_contents('/tmp/public.pem', $publicKeyString);
    }
}
