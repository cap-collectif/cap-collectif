<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Consultation;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class ConsultationVoter extends AbstractOwnerableVoter
{
    public const DELETE = 'DELETE';
    public const CREATE = 'CREATE';
    public const EDIT = 'EDIT';

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

        switch ($attribute) {
            case self::DELETE:
                return self::canDelete($subject, $viewer);

            case self::CREATE:
                return self::canCreate($viewer);

            case self::EDIT:
                return self::canEdit($subject, $viewer);

            default:
                return false;
        }
    }
}
