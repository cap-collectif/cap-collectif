<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class EventVoter extends Voter
{
    const CREATE = 'create';
    const VIEW_FRONT = 'viewFront';
    const VIEW_ADMIN = 'viewAdmin';
    const EDIT = 'edit';
    const DELETE = 'delete';
    const EXPORT = 'export';

    private Manager $manager;

    public function __construct(Manager $manager)
    {
        $this->manager = $manager;
    }

    protected function supports($attribute, $subject)
    {
        if (
            !\in_array($attribute, [
                self::CREATE,
                self::VIEW_FRONT,
                self::VIEW_ADMIN,
                self::EDIT,
                self::DELETE,
                self::EXPORT,
            ])
        ) {
            return false;
        }

        if (!$subject instanceof Event) {
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

        /** @var Event $event */
        $event = $subject;

        switch ($attribute) {
            case self::CREATE:
                return $this->canCreate($viewer);
            case self::VIEW_FRONT:
                return $this->canViewFront($event, $viewer);
            case self::VIEW_ADMIN:
                return $this->canViewAdmin($event, $viewer);
            case self::EDIT:
                return $this->canEdit($event, $viewer);
            case self::DELETE:
                return $this->canDelete($event, $viewer);
            case self::EXPORT:
                return $this->canExport($event, $viewer);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canCreate(?User $viewer): bool
    {
        if (!$viewer) {
            return false;
        }

        if (
            $this->manager->isActive('allow_users_to_propose_events') &&
            $viewer->hasRole(UserRole::ROLE_USER)
        ) {
            return true;
        }

        return $viewer->isAdmin() || $viewer->isProjectAdmin();
    }

    private function canViewFront(Event $event, ?User $viewer): bool
    {
        return $this->canDelete($event, $viewer) || $event->isEnabledOrApproved();
    }

    private function canViewAdmin(Event $event, ?User $viewer): bool
    {
        if (!$viewer || $viewer->isOnlyUser()) {
            return false;
        }

        return $this->canDelete($event, $viewer);
    }

    private function canEdit(Event $event, ?User $viewer): bool
    {
        return $this->canDelete($event, $viewer);
    }

    private function canExport(Event $event, ?User $viewer): bool
    {
        if ($viewer->isAdmin()) {
            return true;
        }
        if ($viewer->isProjectAdmin() && $event->getOwner() === $viewer) {
            return true;
        }

        return false;
    }

    private function canDelete(Event $event, ?User $viewer): bool
    {
        if (!$viewer) {
            return false;
        }

        if ($viewer->isAdmin()) {
            return true;
        }

        if ($viewer->isProjectAdmin() && $event->getOwner() === $viewer) {
            return true;
        }

        if ($event->getAuthor() === $viewer) {
            return true;
        }

        return false;
    }
}
