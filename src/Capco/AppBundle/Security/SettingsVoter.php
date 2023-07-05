<?php

namespace Capco\AppBundle\Security;

use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class SettingsVoter extends Voter
{
    public const VIEW = 'view';
    public const SETTINGS_PERFORMANCE = 'settings.performance';

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

        switch ($attribute) {
            case self::VIEW:
                return $this->canView($subject, $viewer);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canView($subject, User $viewer): bool
    {
        if (!$viewer->isAdmin()) {
            return false;
        }

        if (self::SETTINGS_PERFORMANCE === $subject && !$viewer->isSuperAdmin()) {
            return false;
        }

        return true;
    }
}
