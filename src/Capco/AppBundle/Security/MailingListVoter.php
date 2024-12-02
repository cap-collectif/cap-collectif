<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Entity\MailingList;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class MailingListVoter extends AbstractOwnerableVoter
{
    final public const CREATE = 'create';
    final public const VIEW = 'view';
    final public const DELETE = 'delete';

    protected function supports($attribute, $subject): bool
    {
        return $subject instanceof MailingList
            && \in_array($attribute, [self::CREATE, self::VIEW, self::DELETE]);
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        $viewer = $token->getUser();

        if (!$viewer instanceof User) {
            return false;
        }

        return match ($attribute) {
            self::CREATE => self::canCreate($viewer),
            self::VIEW => self::canView($subject, $viewer),
            self::DELETE => self::canDelete($subject, $viewer),
            default => throw new \LogicException(self::class . ' : unknown attribute ' . $attribute),
        };
    }

    protected static function canDelete(Ownerable $mailingList, User $viewer): bool
    {
        return parent::canDelete($mailingList, $viewer) && $mailingList->isDeletable();
    }
}
