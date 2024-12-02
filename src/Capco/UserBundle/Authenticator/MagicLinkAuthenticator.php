<?php

declare(strict_types=1);

namespace Capco\UserBundle\Authenticator;

use Capco\AppBundle\FileSystem\ConfigFileSystem;
use Capco\UserBundle\Authenticator\Dto\MagicLinkPayload;
use Capco\UserBundle\Authenticator\Exception\InvalidTokenException;
use Capco\UserBundle\Security\Core\User\UserEmailProvider;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\User\UserInterface;

class MagicLinkAuthenticator
{
    final public const JWT_ENCRYPTION_ALGORITHM = 'RS256';
    final public const TOKEN_CONFIG_FOLDER = '/jwt';
    final public const DEFAULT_TOKEN_LIFETIME_IN_MINUTES = 5;

    private ?string $redirectUrl = null;

    public function __construct(private readonly UserEmailProvider $userProvider, private readonly ConfigFileSystem $filesystem, private readonly int $tokenLifetimeInMinutes = self::DEFAULT_TOKEN_LIFETIME_IN_MINUTES)
    {
    }

    /**
     * @throws InvalidTokenException
     */
    public function authenticateToken(string $token): UsernamePasswordToken
    {
        $payload = $this->deserializePayload($token);
        $user = $this->authenticateUser($payload);
        $this->redirectUrl = $this->sanitizeUrl($payload->getRedirect());

        $rolesAsString = array_map(function ($role) {
            return \is_string($role) ? $role : $role->getRole();
        }, $user->getRoles());

        return new UsernamePasswordToken($user, $user->getPassword(), 'main', $rolesAsString);
    }

    public function getRedirectUrl(): ?string
    {
        return $this->redirectUrl;
    }

    private function deserializePayload(string $token): MagicLinkPayload
    {
        $publicKey = $this->filesystem->get(self::TOKEN_CONFIG_FOLDER . '/public.pem')->getContent();

        $payload = JWT::decode($token, new Key($publicKey, self::JWT_ENCRYPTION_ALGORITHM));

        return MagicLinkPayload::createFromPayload($payload);
    }

    private function authenticateUser(MagicLinkPayload $payload): UserInterface
    {
        $user = $this->userProvider->findUser($payload->getEmail());

        if ($this->isOutOfDate($payload)) {
            throw new InvalidTokenException('Token is out of date');
        }

        if (!$user) {
            throw new InvalidTokenException('User not found');
        }

        return $user;
    }

    private function isOutOfDate(MagicLinkPayload $payload): bool
    {
        $expirationDate = $payload->getCreatedAt()->modify("+{$this->tokenLifetimeInMinutes} minutes");
        $now = new \DateTime();

        return $now > $expirationDate;
    }

    private function sanitizeUrl(string $url): ?string
    {
        $url = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $url);

        return false !== filter_var($url, \FILTER_SANITIZE_URL) ? $url : null;
    }
}
