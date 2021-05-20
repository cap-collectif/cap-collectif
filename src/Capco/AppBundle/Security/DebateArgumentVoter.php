<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Interfaces\DebateArgumentInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class DebateArgumentVoter extends Voter
{
    const UPDATE = 'update';
    const DELETE = 'delete';
    const PARTICIPATE = 'participate';

    protected function supports($attribute, $subject)
    {
        if ($subject instanceof DebateArgument) {
            return \in_array($attribute, [self::UPDATE, self::DELETE, self::PARTICIPATE]);
        }
        if ($subject instanceof DebateAnonymousArgument) {
            return \in_array($attribute, [self::PARTICIPATE]);
        }

        return false;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token)
    {
        $viewer = $token->getUser();

        if (!$viewer instanceof User) {
            return false;
        }

        switch ($attribute) {
            case self::DELETE:
                return $this->canDelete($subject, $viewer);
            case self::UPDATE:
                return $this->canUpdate($subject, $viewer);
            case self::PARTICIPATE:
                return self::canParticipate($subject, $viewer);
        }

        return false;
    }

    private function canUpdate(DebateArgument $debateArgument, User $viewer): bool
    {
        return $debateArgument->getAuthor() === $viewer;
    }

    private function canDelete(DebateArgument $debateArgument, User $viewer): bool
    {
        return $viewer->isAdmin() || $debateArgument->getAuthor() === $viewer;
    }

    private static function canParticipate(
        DebateArgumentInterface $debateArgument,
        User $viewer
    ): bool {
        return $debateArgument->getDebate()->viewerCanParticipate($viewer);
    }
}
