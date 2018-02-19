<?php

namespace Capco\UserBundle\Authenticator;

use Capco\UserBundle\Authenticator\Token\ParisToken;
use Capco\UserBundle\MonCompteParis\OpenAmCaller;
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
    protected $openAmCaller;

    public function __construct(HttpUtils $httpUtils, LoggerInterface $logger, OpenAmCaller $openAmCaller)
    {
        $this->httpUtils = $httpUtils;
        $this->logger = $logger;
        $this->openAmCaller = $openAmCaller;
    }

    public function createToken(Request $request, $providerKey)
    {
        $isOnLoginUrl = $this->httpUtils->checkRequestPath($request, '/login-paris');
        $isAlreadyAuthenticated = false;

        $cookies = $request->cookies;

        if ($cookies->has(OpenAmCaller::COOKIE_NAME)) {
            $isAlreadyAuthenticated = true;
        }

        if (!$isOnLoginUrl && !$isAlreadyAuthenticated) {
            return null; // skip paris auth, to let users browse anonymously
        }

        $cookieValue = $cookies->get(OpenAmCaller::COOKIE_NAME);
        $this->openAmCaller->setCookie($cookieValue);
        try {
            $parisId = $this->openAmCaller->getUid();
            $isAlreadyAuthenticated = true;
        } catch (\Exception $e) {
            // Token not valid
            $this->logger->error('Failed to get uuid from cookie: ' . $cookieValue);

            return null;
        }
        $this->logger->info('Creating Paris token for parisId: ' . $parisId);

        $token = new ParisToken($parisId);
        // $token->setAttributes([]);

        return $token;
    }

    public function authenticateToken(TokenInterface $token, UserProviderInterface $userProvider, $providerKey)//: ParisToken
    {
        $username = $token->getUsername();
        $user = $userProvider->loadUserByUsername($username);

        $authenticatedToken = new ParisToken($user, $user->getRoles());
        //$authenticatedToken->setAttributes($token->getAttributes());

        return $authenticatedToken;
    }

    public function supportsToken(TokenInterface $token, $providerKey): bool
    {
        return $token instanceof ParisToken;
    }
}
