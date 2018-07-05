<?php
namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\ProjectVisibilityMode;
use Capco\UserBundle\Entity\User;

trait ProjectVisibilityTrait
{
    public function getVisibilityByViewer(?User $user = null): int
    {
        if (!$user) {
            $user = $this->token->getUser();
        }

        // no user authenticated
        $visibility = ProjectVisibilityMode::VISIBILITY_PUBLIC;
        if (is_object($user) && $user->hasRole('ROLE_SUPER_ADMIN')) {
            $visibility = ProjectVisibilityMode::VISIBILITY_ME;
        } elseif (is_object($user) && $user->hasRole('ROLE_ADMIN')) {
            $visibility = ProjectVisibilityMode::VISIBILITY_ADMIN;
        }

        return $visibility;
    }
}
