<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Enum\UserRole;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserRolesTextResolver implements QueryInterface
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

    public function resolve(User $user): string
    {
        $convertedRoles = array_map(fn ($role) => str_replace(
            [
                UserRole::ROLE_USER,
                UserRole::ROLE_ADMIN,
                UserRole::ROLE_PROJECT_ADMIN,
                UserRole::ROLE_SUPER_ADMIN,
                UserRole::ROLE_MEDIATOR,
            ],
            ['Utilisateur', 'Administrateur', 'Créateur de projet', 'Super Admin', 'Mediateur'],
            $role
        ), $user->getRoles());

        return implode('|', $convertedRoles);
    }
}
