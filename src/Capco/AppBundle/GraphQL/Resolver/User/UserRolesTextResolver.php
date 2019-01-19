<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserRolesTextResolver implements ResolverInterface
{
    public function __invoke(User $user, $viewer, \ArrayObject $context): ?string
    {
        if ($context->offsetExists('disable_acl') && true === $context->offsetGet('disable_acl')) {
            return $this->resolve($user);
        }

        if ($viewer instanceof User && ($user === $viewer || $viewer->isAdmin())) {
            return $this->resolve($user);
        }

        return null;
    }

    private function resolve(User $user)
    {
        $convertedRoles = array_map(function ($role) {
            return str_replace(
                ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
                ['Utilisateur', 'Administrateur', 'Super Admin'],
                $role
            );
        }, $user->getRoles());

        return implode('|', $convertedRoles);
    }
}
