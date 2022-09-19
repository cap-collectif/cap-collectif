<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Entity\MailingList;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class MailingListVoter extends AbstractOwnerableVoter
{
    const CREATE = 'create';
    const VIEW = 'view';
    const DELETE = 'delete';

    protected function supports($attribute, $subject): bool
    {
        return $subject instanceof MailingList &&
            \in_array($attribute, [self::CREATE, self::VIEW, self::DELETE]);
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        $viewer = $token->getUser();

        if (!$viewer instanceof User) {
            return false;
        }

        switch ($attribute) {
            case self::CREATE:
                return self::canCreate($viewer);
            case self::VIEW:
                return self::canView($subject, $viewer);
            case self::DELETE:
                return self::canDelete($subject, $viewer);
        }

        throw new \LogicException(__CLASS__ . ' : unknown attribute ' . $attribute);
    }

    protected static function canDelete(Ownerable $mailingList, User $viewer): bool
    {
        return parent::canDelete($mailingList, $viewer) && $mailingList->isDeletable();
    }
}
