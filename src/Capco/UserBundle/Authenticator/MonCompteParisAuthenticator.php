<?php

namespace Capco\UserBundle\Authenticator;

use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authentication\SimplePreAuthenticatorInterface;
use Symfony\Component\Security\Http\HttpUtils;

class MonCompteParisAuthenticator implements SimplePreAuthenticatorInterface
{
    protected $httpUtils;
    protected $logger;

    public function __construct(HttpUtils $httpUtils, LoggerInterface $logger)
    {
        $this->httpUtils = $httpUtils;
        $this->logger = $logger;
    }

    public function findUsernameInResponse(array $attributes)
    {
        return $attributes['result']['token'];
    }

    public function createToken(Request $request, $providerKey)
    {
        $isOnLoginUrl = $this->httpUtils->checkRequestPath($request, '/login-paris');
        $isAlreadyAuthenticated = false;
        if (!$isOnLoginUrl && !$isAlreadyAuthenticated) {
            return null; // skip paris auth, to let users browse anonymously
        }

        $cookies = $request->cookies;
        var_dump($cookies);
        if ($cookies->has('SYMFONY2_TEST')) {
            var_dump($cookies->get('SYMFONY2_TEST'));
        }
        //$this->samlAuth->requireAuth(); // force the user to login with SAML
        //$attributes = $this->samlAuth->getAttributes();
        $this->logger->info('Creating Paris token from: ' . json_encode($attributes));

        $username = $this->findUsernameInResponse($attributes);
        $token = new SamlToken($username);
        $token->setAttributes($attributes);

        return $token;
    }

    public function authenticateToken(TokenInterface $token, UserProviderInterface $userProvider, $providerKey)//: SamlToken
    {
        $username = $token->getUsername();
        $user = $userProvider->loadUserByUsername($username);

        $user->setSamlAttributes($this->samlIdp, $token->getAttributes());

        $authenticatedToken = new SamlToken($user, $user->getRoles());
        $authenticatedToken->setAttributes($token->getAttributes());

        return $authenticatedToken;
    }

    public function supportsToken(TokenInterface $token, $providerKey): bool
    {
        return $token instanceof SamlToken;
    }
}
