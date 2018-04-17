<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\UserBundle\Entity\User;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorage;

class UserIsGrantedResolver
{
    protected $tokenStorage;

    public function __construct(TokenStorage $tokenStorage, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->tokenStorage = $tokenStorage;
    }

//    public function __invoke(User $userRequest, $user): bool
//    {
//        return $this->isGranted($userRequest, $user);
//    }


    public function isGranted(User $userRequest, $user)
    {
        if(!$user instanceof User) {
            return false;
        }

        if(!$this->tokenStorage->getToken()){
            return false;
        }

        if($user->hasRole('ROLE_ADMIN')){
            return true;
        }

        if($user->hasRole('ROLE_USER') && $user->getId() == $userRequest->getId()) {
            return true;
        }

        $this->logger->warning(__METHOD__ . ' : User with id' . $user->getId() .' try to get informations about user with id  '. $userRequest->getId());

        return false;
    }
}