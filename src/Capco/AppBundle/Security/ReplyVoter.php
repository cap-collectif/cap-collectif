<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\AbstractReply;
use Capco\AppBundle\Entity\Reply;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class ReplyVoter extends AbstractOwnerableVoter
{
    final public const DELETE_REPLY = 'DELETE_REPLY';

    protected function supports($attribute, $subject): bool
    {
        if (!\in_array($attribute, [self::DELETE_REPLY])) {
            return false;
        }

        if (!$subject instanceof AbstractReply) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        $viewer = $token->getUser();

        if (!$viewer instanceof User) {
            $viewer = null;
        }

        /** @var AbstractReply $reply */
        $reply = $subject;

        switch ($attribute) {
            case self::DELETE_REPLY:
                return $this->canDeleteReply($reply, $viewer);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canDeleteReply(AbstractReply $reply, ?User $viewer): bool
    {
        if (!$viewer) {
            return false;
        }

        if ($viewer->isAdmin()) {
            return true;
        }

        if ($reply->isViewerProjectOwner($viewer)) {
            return true;
        }

        if ($reply instanceof Reply && $reply->getAuthor() === $viewer) {
            return true;
        }

        return self::isAdminOrOwnerOrMember($reply->getQuestionnaire(), $viewer);
    }
}
