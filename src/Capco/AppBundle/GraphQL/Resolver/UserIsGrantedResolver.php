<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\UserBundle\Entity\User;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class UserIsGrantedResolver
{
    public function __construct(
        protected TokenStorageInterface $tokenStorage,
        protected LoggerInterface $logger
    ) {
    }

    /**
     * @description
     *  Check if user is viewer or admin. Protect data against other user or .anon
     *  Prevent other user to see other data
     *  For example : when it's called on user field, only owner and admin can access to the field
     *
     * @param null|mixed $viewer
     */
    public function isGranted(
        mixed $user,
        $viewer = null,
        ?\ArrayObject $context = null,
        array $roleRequest = ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']
    ): bool {
        if (
            $context
            && $context->offsetExists('disable_acl')
            && true === $context->offsetGet('disable_acl')
        ) {
            return true;
        }
        if (!$user instanceof User) {
            return false;
        }
        $token = $this->tokenStorage->getToken();
        if (!$token) {
            return false;
        }

        foreach ($roleRequest as $role) {
            if ($user->hasRole($role)) {
                return true;
            }
        }

        if ($viewer instanceof User) {
            if ($user->hasRole('ROLE_USER') && $user->getId() === $viewer->getId()) {
                return true;
            }

            $viewerAndUserBelongsToAnOrganization = $viewer->getOrganizationId() && $user->getOrganizationId();
            if ($viewerAndUserBelongsToAnOrganization) {
                return $viewer->getOrganizationId() === $user->getOrganizationId();
            }

            return false;
        }

        if ($user->hasRole('ROLE_USER') && $user->getId() === $token->getUser()->getId()) {
            return true;
        }

        $this->logger->warning(
            __METHOD__ .
                ' : User with id ' .
                $user->getId() .
                ' try to get information about user with id ' .
                $token->getUser()->getId()
        );

        return false;
    }

    public function isViewer($user, $viewer = null): bool
    {
        if (!$user instanceof User) {
            return false;
        }
        $token = $this->tokenStorage->getToken();
        if (!$token) {
            return false;
        }

        if ($viewer && $viewer instanceof User) {
            if ($user->hasRole('ROLE_USER') && $user->getId() === $viewer->getId()) {
                return true;
            }

            return false;
        }

        return false;
    }
}
