<?php

namespace Capco\UserBundle\Authenticator;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\SimplePreAuthenticatorInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class SimplePreAuthenticator implements SimplePreAuthenticatorInterface
{
    protected $toggleManager;
    protected $samlAuthenticator;
    protected $parisAuthenticator;

    public function __construct(Manager $toggleManager, $samlAuthenticator, $parisAuthenticator)
    {
        $this->toggleManager = $toggleManager;
        $this->samlAuthenticator = $samlAuthenticator;
        $this->parisAuthenticator = $parisAuthenticator;
    }

    public function createToken(Request $request, $providerKey)
    {
        $authenticator = $this->getCurrentAuthenticator();
        if ($authenticator) {
            return $authenticator->createToken($request, $providerKey);
        }

        return null;
    }

    public function authenticateToken(TokenInterface $token, UserProviderInterface $userProvider, $providerKey)
    {
        return $this->getCurrentAuthenticator()->authenticateToken($token, $userProvider, $providerKey);
    }

    public function supportsToken(TokenInterface $token, $providerKey): bool
    {
        return $this->getCurrentAuthenticator()->supportsToken($token, $providerKey);
    }

    private function getCurrentAuthenticator()
    {
        if ($this->toggleManager->isActive('login_saml')) {
            return $this->samlAuthenticator;
        }
        if ($this->toggleManager->isActive('login_paris')) {
            return $this->parisAuthenticator;
        }

        return null;
    }
}
