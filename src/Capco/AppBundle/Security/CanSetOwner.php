<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\UserBundle\Entity\User;

class CanSetOwner
{
    public static function check(Owner $owner, ?User $viewer): bool
    {
        if ($viewer->isAdmin()) {
            return true;
        }

        if ($owner instanceof User) {
            return $viewer === $owner;
        }
        if ($owner instanceof Organization) {
            return null !== $owner->getMembership($viewer);
        }

        throw new \RuntimeException('type of ' . $owner->getUsername() . ' not found');
    }
}
