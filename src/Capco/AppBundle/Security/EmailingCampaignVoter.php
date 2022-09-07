<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class EmailingCampaignVoter extends AbstractOwnerableVoter
{
    const CREATE = 'CREATE';
    const VIEW = 'view';
    const EDIT = 'edit';
    const DELETE = 'delete';
    const SEND = 'send';

    protected function supports($attribute, $subject): bool
    {
        return \in_array($attribute, [
            self::CREATE,
            self::VIEW,
            self::EDIT,
            self::DELETE,
            self::SEND,
        ]) && $subject instanceof EmailingCampaign;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        $viewer = $token->getUser();

        if (!($viewer instanceof User)) {
            return false;
        }

        switch ($attribute) {
            case self::CREATE:
                return self::canCreate($viewer);
            case self::VIEW:
                return self::canView($subject, $viewer);
            case self::EDIT:
                return self::canEdit($subject, $viewer);
            case self::DELETE:
                return self::canDelete($subject, $viewer);
            case self::SEND:
                return self::canSend($subject, $viewer);
            default:
                return false;
        }
    }

    private static function canSend($subject, $viewer): bool
    {
        return self::canEdit($subject, $viewer);
    }
}
