<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Entity\EventReview;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class EventReviewVoter extends Voter
{
    const VIEW = 'view';
    const EDIT = 'edit';

    protected function supports($attribute, $subject)
    {
        if (!\in_array($attribute, [self::VIEW, self::EDIT])) {
            return false;
        }

        if (!$subject instanceof EventReview) {
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

        /** @var EventReview $review */
        $review = $subject;

        switch ($attribute) {
            case self::VIEW:
                return $this->canView($review, $viewer);
            case self::EDIT:
                return $this->canEdit($review, $viewer);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canView(EventReview $review, User $viewer): bool
    {
        return $this->canEdit($review, $viewer);
    }

    private function canEdit(EventReview $review, User $viewer): bool
    {
        if ($viewer->isSuperAdmin()) {
            return true;
        }
        if($review->getStatus() === EventReviewStatusType::APPROVED){
            return false;
        }

        return true;
    }
}
