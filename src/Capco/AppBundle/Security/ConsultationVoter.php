<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Consultation;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class ConsultationVoter extends AbstractOwnerableVoter
{
    final public const DELETE = 'DELETE';
    final public const CREATE = 'CREATE';
    final public const EDIT = 'EDIT';

    protected function supports($attribute, $subject): bool
    {
        if (
            !\in_array($attribute, [
                self::DELETE,
                self::CREATE,
                self::EDIT,
            ])
        ) {
            return false;
        }

        if (!$subject instanceof Consultation) {
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

        return match ($attribute) {
            self::DELETE => self::canDelete($subject, $viewer),
            self::CREATE => self::canCreate($viewer),
            self::EDIT => self::canEdit($subject, $viewer),
            default => false,
        };
    }
}
