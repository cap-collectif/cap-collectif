<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\Repository\CASSSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class SimplePreAuthenticatorUserProvider implements UserProviderInterface
{
    private Manager $toggleManager;
    private ?CASSSOConfiguration $casConfiguration;
    private ?SamlUserProvider $samlProvider;
    private ?CasUserProvider $casProvider;

    public function __construct(
        Manager $toggleManager,
        CASSSOConfigurationRepository $CASSSOConfigurationRepository,
        ?SamlUserProvider $samlProvider,
        ?CasUserProvider $casProvider
    ) {
        $this->toggleManager = $toggleManager;
        $this->casConfiguration = $CASSSOConfigurationRepository->findOneBy([]);
        $this->samlProvider = $samlProvider;
        $this->casProvider = $casProvider;
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
        if (
            $this->toggleManager->isActive('login_cas')
            && $this->casConfiguration
            && $this->casConfiguration->isEnabled()
        ) {
            return $this->casProvider;
        }

        return null;
    }
}
