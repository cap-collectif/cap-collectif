<?php

namespace Capco\AppBundle\PublicApi;

use Capco\AppBundle\Client\OnePasswordClient;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\User\User;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Guard\AbstractGuardAuthenticator;

final class InternalGraphQLBasicAuthenticator extends AbstractGuardAuthenticator
{
    public const ROLE = 'ROLE_INTERNAL_HUB';

    public function __construct(
        private readonly OnePasswordClient $onePasswordClient,
        private readonly string $instanceName
    ) {
    }

    public function supports(Request $request): bool
    {
        return '/graphql/internal' === $request->getPathInfo()
            && 0 === stripos((string) $request->headers->get('Authorization', ''), 'Basic ');
    }

    /**
     * @return array{username: string, password: string}
     */
    public function getCredentials(Request $request): array
    {
        $authorization = (string) $request->headers->get('Authorization', '');
        if (0 !== stripos($authorization, 'Basic ')) {
            return ['username' => '', 'password' => ''];
        }

        $decoded = base64_decode(substr($authorization, 6), true);
        if (false === $decoded || !str_contains($decoded, ':')) {
            return ['username' => '', 'password' => ''];
        }

        [$username, $password] = explode(':', $decoded, 2);

        return ['username' => $username, 'password' => $password];
    }

    public function getUser($credentials, UserProviderInterface $userProvider): ?UserInterface
    {
        if (
            !\is_array($credentials)
            || !\is_string($credentials['username'] ?? null)
            || !\is_string($credentials['password'] ?? null)
            || '' === $credentials['username']
            || '' === $credentials['password']
            || $credentials['username'] !== $this->instanceName
        ) {
            return null;
        }

        try {
            $expectedCredentials = $this->onePasswordClient->credentials($this->instanceName);
        } catch (\Throwable $exception) {
            throw new AuthenticationException('Unable to validate InternalHub credentials.', 0, $exception);
        }

        if (!hash_equals($expectedCredentials['password'], $credentials['password'])) {
            return null;
        }

        return new User($this->instanceName, null, [self::ROLE]);
    }

    public function checkCredentials($credentials, UserInterface $user): bool
    {
        return true;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        return new Response('Invalid InternalHub credentials', Response::HTTP_UNAUTHORIZED, [
            'WWW-Authenticate' => 'Basic realm="graphql-internal"',
        ]);
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, mixed $providerKey): ?Response
    {
        return null;
    }

    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        return new Response('Authentication Required', Response::HTTP_UNAUTHORIZED, [
            'WWW-Authenticate' => 'Basic realm="graphql-internal"',
        ]);
    }

    public function supportsRememberMe(): bool
    {
        return false;
    }
}
