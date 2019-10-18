<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class EventVoter extends Voter
{
    const VIEW = 'view';
    const EDIT = 'edit';

    protected function supports($attribute, $subject)
    {
        if (!\in_array($attribute, [self::VIEW, self::EDIT])) {
            return false;
        }

        if (!$subject instanceof Event) {
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

        /** @var Event $event */
        $event = $subject;

        switch ($attribute) {
            case self::VIEW:
                return $this->canView($event, $viewer);
            case self::EDIT:
                return $this->canEdit($event, $viewer);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canView(Event $event, User $viewer): bool
    {
        return $this->canEdit($event, $viewer) || $event->isEnabled();
    }

    private function canEdit(Event $event, User $viewer): bool
    {
        return $viewer === $event->getAuthor();
    }
}
