<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;

class SimplePreAuthenticatorUserProvider implements UserProviderInterface
{
    private $toggleManager;
    private $samlProvider;
    private $parisProvider;

    public function __construct(
        Manager $toggleManager,
        SamlUserProvider $samlProvider,
        MonCompteParisUserProvider $parisProvider
    ) {
        $this->toggleManager = $toggleManager;
        $this->samlProvider = $samlProvider;
        $this->parisProvider = $parisProvider;
    }

    public function loadUserByUsername($id)
    {
        $provider = $this->getCurrentProvider();

        if (!$provider) {
            throw new UsernameNotFoundException();
        }

        return $provider->loadUserByUsername($id);
    }

    public function refreshUser(UserInterface $user)
    {
        $provider = $this->getCurrentProvider();

        if (!$provider) {
            throw new UnsupportedUserException();
        }

        return $provider->refreshUser($user);
    }

    public function supportsClass($class): bool
    {
        $provider = $this->getCurrentProvider();

        return $provider && $provider->supportsClass($class);
    }

    private function getCurrentProvider(): ?UserProviderInterface
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
