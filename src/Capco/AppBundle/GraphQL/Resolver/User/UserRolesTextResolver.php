<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserRolesTextResolver implements ResolverInterface
{
    public function __invoke(User $user, User $viewer): ?string
    {
        if ($user === $viewer || $viewer->isAdmin()) {
            $convertedRoles = array_map(function ($role) {
                return str_replace(
                    ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
                    ['Utilisateur', 'Administrateur', 'Super Admin'],
                    $role
                );
            }, $user->getRoles());

            return implode('|', $convertedRoles);
        }

        return null;
    }
}
