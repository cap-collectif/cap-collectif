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

    /**
     * if $user is tped, I receive an error 500. But I want a graphql error, so I need to check the instance of $user.
     *
     * @param mixed      $user
     * @param null|mixed $userRequest
     * @param null|mixed $context
     */
    public function isGranted($user, $userRequest = null, $context = null)
    {
        if ($context && isset($context['disale_acl'])) {
            return true;
        }
        if (!$user instanceof User) {
            return false;
        }
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
