<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class SimplePreAuthenticatorUserProvider implements UserProviderInterface
{
    private $toggleManager;
    private $samlProvider;
    private $parisProvider;

    public function __construct(Manager $toggleManager, SamlUserProvider $samlProvider, MonCompteParisUserProvider $parisProvider)
    {
        $this->toggleManager = $toggleManager;
        $this->samlProvider = $samlProvider;
        $this->parisProvider = $parisProvider;
    }

    public function loadUserByUsername($id)
    {
        return $this->getCurrentProvider()->loadUserByUsername($id);
    }

    public function refreshUser(UserInterface $user)
    {
        return $this->getCurrentProvider()->refreshUser($user);
    }

    public function supportsClass($class): bool
    {
        return $this->getCurrentProvider()->supportsClass($class);
    }

    private function getCurrentProvider()
    {
        if ($this->toggleManager->isActive('login_saml')) {
            return $this->samlProvider;
        }
        if ($this->toggleManager->isActive('login_paris')) {
            return $this->parisProvider;
        }

        return null;
    }
}
