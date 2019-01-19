<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserRolesResolver implements ResolverInterface
{
    public function __invoke(User $user, User $viewer): array
    {
        if ($user === $viewer || $viewer->isAdmin()) {
            return $user->getRoles();
        }

        return [];
    }
}
