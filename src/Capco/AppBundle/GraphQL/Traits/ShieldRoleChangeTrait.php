<?php

namespace Capco\AppBundle\GraphQL\Traits;

use Capco\AppBundle\Enum\UserRole;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;

trait ShieldRoleChangeTrait
{
    /** @param array{roles?: null|list<null|string>, ...} $input */
    private function checkShieldRoleChange(User $user, array $input, bool $controlsEnabled): void
    {
        if ($controlsEnabled || !\array_key_exists('roles', $input)) {
            return;
        }

        $role = UserRole::ROLE_SHIELD_AUTHORIZED_USER;
        if ($user->hasRole($role) !== \in_array($role, $input['roles'] ?? [], true)) {
            throw new UserError('The authorized-user shield role is disabled.');
        }
    }
}
