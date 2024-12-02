<?php

namespace Capco\UserBundle\Authenticator;

use Capco\UserBundle\Handler\CasHandler;
use Capco\UserBundle\Security\Core\User\CasUserProvider;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Guard\AbstractGuardAuthenticator;

class CasAuthenticator extends AbstractGuardAuthenticator
{
    public function __construct(protected LoggerInterface $logger, protected CasHandler $casHandler, private readonly CasUserProvider $casUserProvider)
    {
    }

    public function supports(Request $request): bool
    {
        return '/login-cas' === $request->getPathInfo();
    }

    public function getCredentials(Request $request): ?string
    {
        if (!$request->hasSession()) {
            throw new AuthenticationException('Session required for CAS authentication.');
        }

        $session = $request->getSession();
        if ($session->has('cas_login')) {
            $casId = $session->get('cas_login');
            $this->logger->info('CAS ID found in session: ' . $casId);

            return $casId;
        }

        $this->logger->debug('No CAS authentication used.');

        return null;
    }

    public function getUser($credentials, UserProviderInterface $userProvider): ?UserInterface
    {
        if (!$credentials) {
            throw new AuthenticationException('No CAS ID provided.');
        }

        return $this->casUserProvider->loadUserByUsername($credentials);
    }

    public function checkCredentials($credentials, UserInterface $user): bool
    {
        return true;
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, $providerKey): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        return new JsonResponse([
            'message' => 'CAS Authentication Failed: ' . $exception->getMessageKey(),
        ], Response::HTTP_UNAUTHORIZED);
    }

    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        return new JsonResponse([
            'message' => 'Authentication required',
        ], Response::HTTP_UNAUTHORIZED);
    }

    public function supportsRememberMe(): bool
    {
        return false;
    }
}
