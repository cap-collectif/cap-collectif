<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Post;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class PostVoter extends Voter
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
                return $this->canView($post, $viewer);
            case self::CREATE:
                return $this->canCreate($post, $viewer);
            case self::EDIT:
                return $this->canEdit($post, $viewer);
            case self::DELETE:
                return $this->canDelete($post, $viewer);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canCreate(Post $post, User $viewer): bool
    {
        return $viewer->isAdmin() || $viewer->isProjectAdmin();
    }

    private function canEdit(Post $post, User $viewer): bool
    {
        return $this->canDelete($post, $viewer);
    }

    private function canView(Post $post, User $viewer): bool
    {
        return $this->canDelete($post, $viewer);
    }

    private function canDelete(Post $post, User $viewer): bool
    {
        if ($viewer->isAdmin()) {
            return true;
        }

        if ($post->getOwner() && $post->getOwner() === $viewer) {
            return true;
        }

        return false;
    }
}
