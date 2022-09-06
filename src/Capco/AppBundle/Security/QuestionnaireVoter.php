<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class QuestionnaireVoter extends AbstractOwnerableVoter
{
    const CREATE = 'create';
    const VIEW = 'view';
    const EDIT = 'edit';
    const DELETE = 'delete';
    const EXPORT = 'export';

    protected function supports($attribute, $subject): bool
    {
        if (
            !\in_array($attribute, [
                self::CREATE,
                self::VIEW,
                self::EDIT,
                self::DELETE,
                self::EXPORT,
            ])
        ) {
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
            case self::CREATE:
                return self::canCreate($viewer);
            case self::VIEW:
                return self::canView($questionnaire, $viewer);
            case self::EDIT:
                return self::canEdit($questionnaire, $viewer);
            case self::DELETE:
                return self::canDelete($questionnaire, $viewer);
            case self::EXPORT:
                return self::canExport($questionnaire, $viewer);
            default:
                return false;
        }
    }

    private static function canExport(Questionnaire $questionnaire, User $viewer): bool
    {
        return self::isAdminOrOwnerOrMember($questionnaire, $viewer);
    }
}
