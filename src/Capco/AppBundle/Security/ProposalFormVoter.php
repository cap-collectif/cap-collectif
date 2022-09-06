<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class ProposalFormVoter extends AbstractOwnerableVoter
{
    const CREATE = 'create';
    const VIEW = 'view';
    const EDIT = 'edit';
    const DELETE = 'delete';
    const DUPLICATE = 'duplicate';

    protected function supports($attribute, $subject)
    {
        if (
            !\in_array($attribute, [
                self::CREATE,
                self::EDIT,
                self::DELETE,
                self::VIEW,
                self::DUPLICATE,
            ])
        ) {
            return false;
        }

        if (!$subject instanceof ProposalForm) {
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

        if (self::CREATE === $attribute) {
            return self::canCreate($viewer);
        }
        if (self::DELETE === $attribute) {
            return self::canDelete($subject, $viewer);
        }

        return self::isAdminOrOwnerOrMember($subject, $viewer);
    }
}
