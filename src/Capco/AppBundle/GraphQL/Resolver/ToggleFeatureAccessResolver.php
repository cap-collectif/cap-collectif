<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;

class ToggleFeatureAccessResolver
{
    public function isGranted(string $feature, ?User $user): bool
    {
        if (!$user instanceof User) {
            return false;
        }

        if (!$user->isAdmin()) {
            return false;
        }

        if (!$user->isSuperAdmin() && \in_array($feature, Manager::SUPER_ADMIN_ALLOWED_FEATURES, true)) {
            return false;
        }

        return true;
    }
}
