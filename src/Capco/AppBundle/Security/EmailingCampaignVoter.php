<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class EmailingCampaignVoter extends AbstractOwnerableVoter
{
    final public const CREATE = 'CREATE';
    final public const VIEW = 'view';
    final public const EDIT = 'edit';
    final public const DELETE = 'delete';
    final public const SEND = 'send';
    final public const TEST = 'test';
    final public const CANCEL = 'cancel';

    protected function supports($attribute, $subject): bool
    {
        return \in_array($attribute, [
            self::CREATE,
            self::VIEW,
            self::EDIT,
            self::DELETE,
            self::SEND,
            self::TEST,
            self::CANCEL,
        ]) && $subject instanceof EmailingCampaign;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        $viewer = $token->getUser();

        if (!($viewer instanceof User)) {
            return false;
        }

        return match ($attribute) {
            self::CREATE => self::canCreate($viewer),
            self::VIEW => self::canView($subject, $viewer),
            self::EDIT => self::canEdit($subject, $viewer),
            self::DELETE => self::canDelete($subject, $viewer),
            self::SEND => self::canSend($subject, $viewer),
            self::TEST => self::canTest($subject, $viewer),
            self::CANCEL => self::canCancel($subject, $viewer),
            default => false,
        };
    }

    private static function canSend($subject, $viewer): bool
    {
        return self::canEdit($subject, $viewer);
    }

    private static function canTest($subject, $viewer): bool
    {
        return self::canEdit($subject, $viewer);
    }

    private static function canCancel($subject, $viewer): bool
    {
        return self::canEdit($subject, $viewer);
    }
}
