<?php

namespace Capco\UserBundle\Authenticator;

use Capco\Capco\UserBundle\Exception\MissingSamlAuthAttributeException;
use Capco\UserBundle\Security\Core\User\SamlUserProvider;
use Psr\Log\LoggerInterface;
use SimpleSAML\Auth\Simple;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Guard\AbstractGuardAuthenticator;

class SamlAuthenticator extends AbstractGuardAuthenticator
{
    public function __construct(protected Simple $samlAuth, protected string $samlIdp, protected LoggerInterface $logger, private readonly SamlUserProvider $samlUserProvider)
    {
    }

    public function supports(Request $request): bool
    {
        return '/login-saml' === $request->getPathInfo();
    }

    public function getCredentials(Request $request)
    {
        if (!$this->samlAuth->isAuthenticated()) {
            $this->samlAuth->requireAuth();
        }

        return $this->samlAuth->getAttributes();
    }

    /**
     * @param mixed $credentials
     *
     * @throws MissingSamlAuthAttributeException
     */
    public function getUser($credentials, UserProviderInterface $userProvider): ?UserInterface
    {
        if (!$credentials) {
            throw new CustomUserMessageAuthenticationException('No credentials provided.');
        }

        $username = $this->findUsernameInResponse($credentials);

        return $this->samlUserProvider->loadUserByUsername($username);
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
            'message' => $exception->getMessageKey(),
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

    /**
     * @throws MissingSamlAuthAttributeException
     */
    private function findUsernameInResponse(array $attributes): string
    {
        $authAttribute = $this->getAuthenticationAttribute();
        if (!isset($attributes[$authAttribute])) {
            throw new MissingSamlAuthAttributeException(sprintf("Attribute '%s' was not found in SAMLResponse '%s'", $authAttribute, print_r($attributes, true)));
        }

        return $attributes[$authAttribute][0];
    }

    private function getAuthenticationAttribute(): string
    {
        return match ($this->samlIdp) {
            'dev', 'grandest' => 'email',
            'univ-lyon1' => 'urn:oid:0.9.2342.19200300.100.1.3',
            'cd59', 'april', 'clermont' => 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
            'sorbonne' => 'mail',
            default => throw new \RuntimeException('Could not find authentication attribute for idp: ' . $this->samlIdp),
        };
    }
}
