<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\UserBundle\Entity\User;

interface ViewerPermissionInterface
{
    public function viewerCanSee(?User $user): bool;
}
