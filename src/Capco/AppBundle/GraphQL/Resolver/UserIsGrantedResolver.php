<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\UserBundle\Entity\User;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorage;

class UserIsGrantedResolver
{
    protected $tokenStorage;
    protected $logger;

    public function __construct(TokenStorage $tokenStorage, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->tokenStorage = $tokenStorage;
    }

    public function isGranted(User $user, $userRequest = null)
    {
        $token = $this->tokenStorage->getToken();
        if (!$token) {
            return false;
        }

        if ($user->hasRole('ROLE_ADMIN')) {
            return true;
        }

        if ($userRequest) {
            if ($user->hasRole('ROLE_USER') && $user->getId() === $userRequest->getId()) {
                return true;
            }

            return false;
        }

        if ($user->hasRole('ROLE_USER') && $user->getId() === $token->getUser()->getId()) {
            return true;
        }

        $this->logger->warning(
            __METHOD__ . ' : User with id ' . $user->getId() . ' try to get informations about user with id ' . $token->getUser(
            )->getId()
        );

        return false;
    }
}
