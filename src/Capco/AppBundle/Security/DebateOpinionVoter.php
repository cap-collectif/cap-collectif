<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class DebateOpinionVoter extends Voter
{
    const CREATE = 'create';
    const EDIT = 'edit';
    const DELETE = 'delete';

    protected function supports($attribute, $subject): bool
    {
        if (!\in_array($attribute, [self::CREATE, self::EDIT, self::DELETE])) {
            return false;
        }

        if (!$subject instanceof DebateOpinion) {
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

        /** @var DebateOpinion $debateOpinion */
        $debateOpinion = $subject;

        switch ($attribute) {
            case self::CREATE:
                return $this->canCreate($viewer);
            case self::EDIT:
                return $this->canEdit($debateOpinion, $viewer);
            case self::DELETE:
                return $this->canDelete($debateOpinion, $viewer);
            default:
                return false;
        }
    }

    private function canCreate(User $viewer): bool
    {
        return $viewer->isProjectAdmin();
    }

    private function canEdit(DebateOpinion $debateOpinion, User $viewer): bool
    {
        return $this->canDelete($debateOpinion, $viewer);
    }

    private function canDelete(DebateOpinion $debateOpinion, User $viewer): bool
    {
        $owner = $debateOpinion
            ->getDebate()
            ->getProject()
            ->getOwner();

        if ($viewer->isAdmin()) {
            return true;
        }

        if ($owner === $viewer) {
            return true;
        }

        if ($debateOpinion->getAuthor() === $viewer) {
            return true;
        }

        return false;
    }
}
