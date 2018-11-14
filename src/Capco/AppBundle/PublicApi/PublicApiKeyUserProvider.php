<?php
namespace Capco\AppBundle\PublicApi;

use Symfony\Component\Security\Core\User\User;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;

class PublicApiKeyUserProvider implements UserProviderInterface
{
    private $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
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
