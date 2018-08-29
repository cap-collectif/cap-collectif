<?php
namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\UserBundle\Entity\User;

trait ProjectVisibilityTrait
{
    public function getVisibilityForViewer($viewer = null): array
    {
        // user not authenticated
        $visibility = [];
        $visibility[] = ProjectVisibilityMode::VISIBILITY_PUBLIC;

        /** @var User $viewer */
        if ($viewer) {
            if (is_object($viewer) && $viewer->hasRole('ROLE_SUPER_ADMIN')) {
                $visibility[] = ProjectVisibilityMode::VISIBILITY_ME;
                $visibility[] = ProjectVisibilityMode::VISIBILITY_ADMIN;
                $visibility[] = ProjectVisibilityMode::VISIBILITY_CUSTOM;
            } elseif (is_object($viewer) && $viewer->hasRole('ROLE_ADMIN')) {
                $visibility[] = ProjectVisibilityMode::VISIBILITY_ADMIN;
            }
        }

        return $visibility;
    }
}
