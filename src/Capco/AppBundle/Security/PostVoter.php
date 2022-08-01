<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Entity\Post;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class PostVoter extends AbstractOwnerableVoter
{
    const VIEW = 'view';
    const CREATE = 'create';
    const EDIT = 'edit';
    const DELETE = 'delete';

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

        switch ($attribute) {
            case self::VIEW:
                return self::canView($post, $viewer);
            case self::CREATE:
                return self::canCreate($viewer);
            case self::EDIT:
                return self::canEdit($post, $viewer);
            case self::DELETE:
                return self::canDelete($post, $viewer);
            default:
                return false;
        }
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
