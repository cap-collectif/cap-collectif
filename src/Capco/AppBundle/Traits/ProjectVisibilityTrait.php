<?php
namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\ProjectVisibilityMode;

trait ProjectVisibilityTrait
{
    public function getVisibilityByViewer($user = null): int
    {
        if (property_exists($this, 'token')) {
            if (!$user && !$this->token) {
                $user = null;
            } elseif (!$user && $this->token) {
                $user = $this->token->getUser();
            }
        }

        // no user authenticated
        $visibility = ProjectVisibilityMode::VISIBILITY_PUBLIC;

        if ($user) {
            if (is_object($user) && $user->hasRole('ROLE_SUPER_ADMIN')) {
                $visibility = ProjectVisibilityMode::VISIBILITY_ME;
            } elseif (is_object($user) && $user->hasRole('ROLE_ADMIN')) {
                $visibility = ProjectVisibilityMode::VISIBILITY_ADMIN;
            }
        }

        return $visibility;
    }

    /**
     * get user visibility and check if I'm author of project
     * TODO rename by isViewerAllowed or isViewerGranted
     */
    public function canDisplayForViewer($user = null): bool
    {
        $viewerVisibility = $this->getVisibilityByViewer($user);

        return $this->getVisibility() >= $viewerVisibility || $this->getAuthor() === $user;
    }
}
