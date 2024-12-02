<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Entity\Post;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class PostVoter extends AbstractOwnerableVoter
{
    final public const VIEW = 'view';
    final public const CREATE = 'create';
    final public const EDIT = 'edit';
    final public const DELETE = 'delete';

    protected function supports($attribute, $subject)
    {
        if (!\in_array($attribute, [self::VIEW, self::CREATE, self::EDIT, self::DELETE])) {
            return false;
        }

        if (!$subject instanceof Post) {
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

        /** @var Post $post */
        $post = $subject;

        return match ($attribute) {
            self::VIEW => self::canView($post, $viewer),
            self::CREATE => self::canCreate($viewer),
            self::EDIT => self::canEdit($post, $viewer),
            self::DELETE => self::canDelete($post, $viewer),
            default => false,
        };
    }

    protected static function canEdit(Ownerable $ownerable, User $viewer): bool
    {
        if (parent::canEdit($ownerable, $viewer)) {
            return true;
        }

        foreach ($ownerable->getProjects() as $project) {
            if (parent::canEdit($project, $viewer)) {
                return true;
            }
        }

        return false;
    }

    protected static function canView(Ownerable $ownerable, User $viewer): bool
    {
        if (parent::canEdit($ownerable, $viewer)) {
            return true;
        }

        foreach ($ownerable->getProjects() as $project) {
            if (parent::canEdit($project, $viewer)) {
                return true;
            }
        }

        return false;
    }

    protected static function canDelete(Ownerable $ownerable, User $viewer): bool
    {
        if (parent::canDelete($ownerable, $viewer)) {
            return true;
        }

        foreach ($ownerable->getProjects() as $project) {
            if (parent::canDelete($project, $viewer)) {
                return true;
            }
        }

        return false;
    }
}
