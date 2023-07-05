<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Comment;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class CommentVoter extends Voter
{
    public const DELETE = 'delete';

    protected function supports($attribute, $subject): bool
    {
        if (!\in_array($attribute, [self::DELETE])) {
            return false;
        }

        if (!$subject instanceof Comment) {
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

        $comment = $subject;

        switch ($attribute) {
            case self::DELETE:
                return $this->canDelete($comment, $viewer);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canDelete(Comment $comment, User $viewer): bool
    {
        return $comment->getAuthor() === $viewer || $viewer->isAdmin();
    }
}
