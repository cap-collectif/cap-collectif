<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class DebateArgumentVoter extends Voter
{
    const UPDATE = 'update';
    const DELETE = 'delete';

    protected function supports($attribute, $subject)
    {
        return (
            \in_array($attribute, [self::UPDATE, self::DELETE]) &&
            $subject instanceof DebateArgument
        );
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token)
    {
        $viewer = $token->getUser();

        if (!$viewer instanceof User) {
            $viewer = null;
        }

        switch ($attribute) {
            case self::DELETE:
                return $this->canDelete($subject, $viewer);
            case self::UPDATE:
                return $this->canUpdate($subject, $viewer);
        }

        return false;
    }

    private function canUpdate(DebateArgument $debateArgument, User $viewer): bool
    {
        return ($debateArgument->getAuthor() === $viewer);
    }

    private function canDelete(DebateArgument $debateArgument, User $viewer): bool
    {
        return ($viewer->isAdmin() || $debateArgument->getAuthor() === $viewer);
    }
}
