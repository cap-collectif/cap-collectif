<?php

namespace Capco\AppBundle\Security;

use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class SettingsVoter extends Voter
{
    final public const VIEW = 'view';

    protected function supports($attribute, $subject)
    {
        if (!\is_string($subject)) {
            return false;
        }

        if (!\in_array($attribute, [self::VIEW])) {
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

        return match ($attribute) {
            self::VIEW => $this->canView($viewer),
            default => throw new \LogicException('This code should not be reached!'),
        };
    }

    private function canView(User $viewer): bool
    {
        return $viewer->isAdmin();
    }
}
