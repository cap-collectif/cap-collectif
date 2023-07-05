<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class PendingOrganizationInvitationVoter extends Voter
{
    public const DELETE = 'delete';

    public function canDelete(PendingOrganizationInvitation $invitation, User $viewer): bool
    {
        $organization = $invitation->getOrganization();

        return $viewer->isAdmin() || $organization->isUserAdmin($viewer);
    }

    protected function supports($attribute, $subject): bool
    {
        if (self::DELETE != $attribute) {
            return false;
        }

        if (!$subject instanceof PendingOrganizationInvitation) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        $viewer = $token->getUser();

        if (!$viewer instanceof User) {
            return false;
        }

        switch ($attribute) {
            case self::DELETE:
                return $this->canDelete($subject, $viewer);

            default:
                return false;
        }
    }
}
