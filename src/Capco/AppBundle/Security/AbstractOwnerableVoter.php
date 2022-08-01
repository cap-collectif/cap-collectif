<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

abstract class AbstractOwnerableVoter extends Voter
{
    protected static function isAdminOrOwnerOrMember(Ownerable $ownerable, User $viewer): bool
    {
        return self::isAdminOrOwner($ownerable, $viewer) ||
            self::isMemberOfTheOwningOrganisation($ownerable, $viewer);
    }

    protected static function isAdminOrOwner(Ownerable $ownerable, User $viewer): bool
    {
        return $viewer->isAdmin() || self::isOwner($ownerable, $viewer);
    }

    protected static function isMemberOfAnyOrganisation(User $viewer): bool
    {
        return $viewer->getMemberOfOrganizations()->count() > 0;
    }

    protected static function isAdminOrCreatorInTheOwningOrganisation(
        Ownerable $ownerable,
        User $viewer
    ): bool {
        if ($ownerable->getOwner() instanceof Organization) {
            $membership = $ownerable->getOwner()->getMembership($viewer);
            if ($membership) {
                return OrganizationMemberRoleType::ADMIN === $membership->getRole() ||
                    self::isCreator($ownerable, $viewer);
            }
        }

        return false;
    }

    private static function isOwner(Ownerable $ownerable, User $viewer): bool
    {
        return $ownerable->getOwner() === $viewer;
    }

    private static function isMemberOfTheOwningOrganisation(
        Ownerable $ownerable,
        User $viewer
    ): bool {
        if ($ownerable->getOwner() instanceof Organization) {
            return null !== $ownerable->getOwner()->getMembership($viewer);
        }

        return false;
    }

    /**
     * @todo remove method_exists when creator in ownerable interface
     */
    private static function isCreator(Ownerable $ownerable, User $viewer): bool
    {
        return method_exists($ownerable, 'getCreator') && $ownerable->getCreator() === $viewer;
    }
}
