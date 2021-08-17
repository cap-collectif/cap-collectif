<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class QuestionnaireVoter extends Voter
{
    const VIEW = 'view';
    const EDIT = 'edit';
    const DELETE = 'delete';

    protected function supports($attribute, $subject): bool
    {
        if (!\in_array($attribute, [self::VIEW, self::EDIT, self::DELETE])) {
            return false;
        }

        if (!$subject instanceof Questionnaire) {
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

        /** @var Questionnaire $questionnaire */
        $questionnaire = $subject;

        switch ($attribute) {
            case self::VIEW:
                return $this->canView($questionnaire, $viewer);
            case self::EDIT:
                return $this->canEdit($questionnaire, $viewer);
            case self::DELETE:
                return $this->canDelete($questionnaire, $viewer);
            default:
                return false;
        }
    }

    private function canEdit(Questionnaire $questionnaire, User $viewer): bool
    {
        return $this->canDelete($questionnaire, $viewer);
    }

    private function canView(Questionnaire $questionnaire, User $viewer): bool
    {
        return $this->canDelete($questionnaire, $viewer);
    }

    private function canDelete(Questionnaire $questionnaire, User $viewer): bool
    {
        if ($viewer->isAdmin()) {
            return true;
        }

        if ($questionnaire->getOwner() && $questionnaire->getOwner() === $viewer) {
            return true;
        }

        return false;
    }
}
