<?php

namespace Capco\UserBundle\Authenticator;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authentication\SimplePreAuthenticatorInterface;

class SimplePreAuthenticator implements SimplePreAuthenticatorInterface
{
    protected $toggleManager;
    protected $samlAuthenticator;
    protected $parisAuthenticator;

    public function __construct(
        Manager $toggleManager,
        MonCompteParisAuthenticator $parisAuthenticator,
        ?SamlAuthenticator $samlAuthenticator = null
    ) {
        $this->toggleManager = $toggleManager;
        $this->parisAuthenticator = $parisAuthenticator;
        $this->samlAuthenticator = $samlAuthenticator;
    }

    public function createToken(Request $request, $providerKey)
    {
        $authenticator = $this->getCurrentAuthenticator();
        if ($authenticator) {
            return $authenticator->createToken($request, $providerKey);
        }

        return null;
    }

    public function authenticateToken(
        TokenInterface $token,
        UserProviderInterface $userProvider,
        $providerKey
    ) {
        return $this->getCurrentAuthenticator()->authenticateToken(
            $token,
            $userProvider,
            $providerKey
        );
    }

    public function supportsToken(TokenInterface $token, $providerKey): bool
    {
        $authenticator = $this->getCurrentAuthenticator();

        return $authenticator ? $authenticator->supportsToken($token, $providerKey) : false;
    }

    private function getCurrentAuthenticator(): ?SimplePreAuthenticatorInterface
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
