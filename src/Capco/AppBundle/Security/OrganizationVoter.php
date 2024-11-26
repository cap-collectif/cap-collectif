<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class OrganizationVoter extends Voter
{
    final public const VIEW = 'view';
    final public const CREATE = 'create';
    final public const EDIT = 'edit';
    final public const DELETE = 'delete';
    final public const KICK = 'kick';

    protected function supports($attribute, $subject): bool
    {
        if ($subject instanceof Organization) {
            return \in_array(
                $attribute,
                [self::VIEW, self::EDIT, self::CREATE, self::DELETE, self::KICK],
                true
            );
        }

        return false;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        $viewer = $token->getUser();

        if (!$viewer instanceof User) {
            return false;
        }

        switch ($attribute) {
            case self::EDIT:
                return self::canEdit($subject, $viewer);

            case self::KICK:
                return self::canKick($subject, $viewer);
        }

        return false;
    }

    private static function canEdit(Organization $organization, User $viewer): bool
    {
        return $viewer->isAdmin() || $organization->isUserAdmin($viewer);
    }

    private static function canKick(Organization $organization, User $viewer): bool
    {
        return $viewer->isAdmin() || $organization->isUserAdmin($viewer);
    }
}
