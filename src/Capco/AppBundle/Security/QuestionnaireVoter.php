<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class QuestionnaireVoter extends AbstractOwnerableVoter
{
    final public const CREATE = 'create';
    final public const VIEW = 'view';
    final public const EDIT = 'edit';
    final public const DELETE = 'delete';
    final public const EXPORT = 'export';

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

        return match ($attribute) {
            self::CREATE => self::canCreate($viewer),
            self::VIEW => self::canView($questionnaire, $viewer),
            self::EDIT => self::canEdit($questionnaire, $viewer),
            self::DELETE => self::canDelete($questionnaire, $viewer),
            self::EXPORT => self::canExport($questionnaire, $viewer),
            default => false,
        };
    }

    private static function canExport(Questionnaire $questionnaire, User $viewer): bool
    {
        return self::isAdminOrOwnerOrMember($questionnaire, $viewer);
    }
}
