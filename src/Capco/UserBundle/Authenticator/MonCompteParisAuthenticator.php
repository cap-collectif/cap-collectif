<?php

namespace Capco\UserBundle\Authenticator;

use Capco\UserBundle\Authenticator\Token\ParisToken;
use Capco\UserBundle\MonCompteParis\OpenAmClient;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authentication\SimplePreAuthenticatorInterface;
use Symfony\Component\Security\Http\HttpUtils;

class MonCompteParisAuthenticator implements SimplePreAuthenticatorInterface
{
    protected HttpUtils $httpUtils;
    protected LoggerInterface $logger;
    protected OpenAmClient $openAmCaller;

    public function __construct(
        HttpUtils $httpUtils,
        LoggerInterface $logger,
        OpenAmClient $openAmCaller
    ) {
        $this->httpUtils = $httpUtils;
        $this->logger = $logger;
        $this->openAmCaller = $openAmCaller;
    }

    public function createToken(Request $request, $providerKey)
    {
        $isOnLoginUrl = $this->httpUtils->checkRequestPath($request, '/login-paris');
        $isAlreadyAuthenticated = false;

        $cookies = $request->cookies;

        if ($cookies->has(OpenAmClient::COOKIE_NAME)) {
            $isAlreadyAuthenticated = true;
        }

        if (!$isOnLoginUrl && !$isAlreadyAuthenticated) {
            $this->logger->debug(
                'Skipping MonCompteParisAuthenticator, to let user browse anonymously.'
            );

            return null;
        }

        $cookieValue = $cookies->get(OpenAmClient::COOKIE_NAME);
        if (!$cookieValue) {
            $this->logger->error('Skipping MonCompteParisAuthenticator because no cookie.');

            return null;
        }

        $this->openAmCaller->setCookie($cookieValue);

        try {
            $parisId = $this->openAmCaller->getUid();
        } catch (\RuntimeException $e) {
            $this->logger->critical('Failed to get uuid from cookie !', ['cookie' => $cookieValue]);

            return null;
        }
        $this->logger->info('Creating Paris token for parisId: {uuid}', ['uuid' => $parisId]);

        return new ParisToken($parisId);
    }

    public function authenticateToken(
        TokenInterface $token,
        UserProviderInterface $userProvider,
        $providerKey
    ): ParisToken {
        $username = $token->getUsername();
        $user = $userProvider->loadUserByUsername($username);

        return new ParisToken($user, $user->getRoles());
    }

    public function supportsToken(TokenInterface $token, $providerKey): bool
    {
        return $token instanceof ParisToken;
    }
}
