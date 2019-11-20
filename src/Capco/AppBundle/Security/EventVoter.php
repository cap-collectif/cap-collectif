<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
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
            $viewer = null;
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

    private function canView(Event $event, ?User $viewer): bool
    {
        if(!$viewer) {
            return $event->isEnabledOrApproved();
        }

        return $this->canEdit($event, $viewer) || $event->isEnabledOrApproved();
    }

    private function canEdit(Event $event, User $viewer): bool
    {
        if ($viewer->isSuperAdmin()) {
            return true;
        }
        if ($viewer !== $event->getAuthor() && !$viewer->isAdmin()) {
            return false;
        }
        if ($event->getReview() && $event->getReview()->getStatus() === EventReviewStatusType::APPROVED) {
            return false;
        }

        return true;
    }
}
