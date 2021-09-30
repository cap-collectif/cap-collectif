<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ProposalVoter extends Voter
{
    public const CHANGE_STATUS = 'changeStatus';
    public const CHANGE_CONTENT = 'changeContent';
    public const EDIT = 'edit';

    protected function supports($attribute, $subject)
    {
        if (!\in_array($attribute, [self::CHANGE_STATUS, self::CHANGE_CONTENT, self::EDIT])) {
            return false;
        }

        if (!$subject instanceof Proposal) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token)
    {
        $viewer = $token->getUser();

        if (!$viewer instanceof User) {
            return false;
        }
        switch ($attribute) {
            case self::CHANGE_STATUS:
            case self::EDIT:
                return self::isOwnerOrAdmin($subject, $viewer);
            case self::CHANGE_CONTENT:
                return self::canChangeContent($subject, $viewer);
            default:
                return false;
        }
    }

    private static function canChangeContent(Proposal $proposal, User $viewer): bool
    {
        return $proposal->viewerCanUpdate($viewer) &&
            ($proposal->canContribute($viewer) || $proposal->viewerIsAdminOrOwner($viewer));
    }

    private static function isOwnerOrAdmin(Proposal $proposal, User $viewer): bool
    {
        return $proposal->viewerIsAdminOrOwner($viewer);
    }
}
