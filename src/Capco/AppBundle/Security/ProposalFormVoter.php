<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ProposalFormVoter extends Voter
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
            return $viewer->isProjectAdmin();
        }

        return self::isOwnerOrAdmin($subject, $viewer);
    }

    private static function isOwnerOrAdmin(ProposalForm $proposalForm, User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $proposalForm->getOwner() === $user;
    }
}
