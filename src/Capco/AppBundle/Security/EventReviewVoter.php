<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Entity\EventReview;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class EventReviewVoter extends Voter
{
    public const EDIT = 'edit';

    protected function supports($attribute, $subject): bool
    {
        if (!\in_array($attribute, [self::EDIT])) {
            return false;
        }

        if (!$subject instanceof EventReview) {
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

        /** @var EventReview $review */
        $review = $subject;

        switch ($attribute) {
            case self::EDIT:
                return $this->canEdit($review, $viewer);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canEdit(EventReview $review, User $viewer): bool
    {
        if ($viewer->isSuperAdmin()) {
            return true;
        }

        if (EventReviewStatusType::AWAITING === $review->getStatus() && $viewer->isAdmin()) {
            return true;
        }

        return false;
    }
}
