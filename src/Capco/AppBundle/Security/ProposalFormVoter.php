<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class ProposalFormVoter extends AbstractOwnerableVoter
{
    final public const CREATE = 'create';
    final public const VIEW = 'view';
    final public const EDIT = 'edit';
    final public const DELETE = 'delete';
    final public const DUPLICATE = 'duplicate';
    final public const IMPORT_PROPOSALS = 'import_proposals';

    protected function supports($attribute, $subject)
    {
        if (
            !\in_array($attribute, [
                self::CREATE,
                self::EDIT,
                self::DELETE,
                self::VIEW,
                self::DUPLICATE,
                self::IMPORT_PROPOSALS,
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
