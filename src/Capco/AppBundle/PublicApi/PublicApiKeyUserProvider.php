<?php

namespace Capco\AppBundle\PublicApi;

use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\User;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class PublicApiKeyUserProvider implements UserProviderInterface
{
    public function __construct(
        private readonly UserRepository $userRepository
    ) {
    }

    public function loadUserByUsername($apiKey)
    {
        return $this->userRepository->findUserByPublicApiKey($apiKey);
    }

    public function refreshUser(UserInterface $user)
    {
        // The token is sent in each request, so authentication is stateless
        throw new UnsupportedUserException();
    }

    public function supportsClass($class)
    {
        return User::class === $class;
    }
}
