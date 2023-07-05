<?php

namespace Capco\UserBundle\Authenticator;

use Capco\UserBundle\Authenticator\Token\CASToken;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Handler\CasHandler;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authentication\SimplePreAuthenticatorInterface;
use Symfony\Component\Security\Http\HttpUtils;

/**
 * Class CasAuthenticator.
 */
class CasAuthenticator implements SimplePreAuthenticatorInterface
{
    protected HttpUtils $httpUtils;

    protected LoggerInterface $logger;

    protected CasHandler $casHandler;

    public function __construct(
        HttpUtils $httpUtils,
        LoggerInterface $logger,
        CasHandler $casHandler
    ) {
        $this->httpUtils = $httpUtils;
        $this->logger = $logger;
        $this->casHandler = $casHandler;
    }

    /**
     * @param $providerKey
     *
     * @return CASToken|void
     */
    public function createToken(Request $request, $providerKey)
    {
        $isOnLoginUrl = $this->httpUtils->checkRequestPath($request, '/login-cas');

        $isAlreadyAuthenticated = false;
        $casId = null;
        $session = $request->getSession();

        if ($session->has('cas_login')) {
            $isAlreadyAuthenticated = true;
            $casId = $request->getSession()->get('cas_login');
        }

        if (!$isOnLoginUrl && !$isAlreadyAuthenticated) {
            $this->logger->debug(
                'Skipping CasAuthenticator, to let user browse anonymously.'
            );

            return null;
        }

        if (empty($casId)) {
            $this->logger->debug('no cas authentication used');

            return;
        }

        $this->logger->info('Creating CAS token from received cas login: ' . json_encode($casId));

        $username = $casId;
        $token = new CASToken($username);
        $token->setAttributes([$username]);

        return $token;
    }

    /**
     * @param $providerKey
     */
    public function authenticateToken(
        TokenInterface $token,
        UserProviderInterface $userProvider,
        $providerKey
    ): CASToken {
        $username = $token->getUsername();
        $user = $userProvider->loadUserByUsername($username);

        if ($user instanceof User) {
            $user->setCasId($token->getUsername());
            $user->setUsername($token->getUsername());
        }

        $authenticatedToken = new CASToken($user, $user->getRoles());
        $authenticatedToken->setAttributes($token->getAttributes());

        return $authenticatedToken;
    }

    /**
     * @param $providerKey
     */
    public function supportsToken(TokenInterface $token, $providerKey): bool
    {
        return $token instanceof CASToken;
    }
}
