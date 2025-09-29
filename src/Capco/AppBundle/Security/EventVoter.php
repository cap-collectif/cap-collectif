<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class EventVoter extends AbstractOwnerableVoter
{
    final public const CREATE = 'create';
    final public const VIEW_FRONT = 'viewFront';
    final public const VIEW_ADMIN = 'viewAdmin';
    final public const EDIT = 'edit';
    final public const DELETE = 'delete';
    final public const EXPORT = 'export';

    public function __construct(
        private readonly Manager $manager
    ) {
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

        return match ($attribute) {
            self::CREATE => $viewer && $this->canCreateEvent($viewer),
            self::VIEW_FRONT => self::canViewFront($event, $viewer),
            self::VIEW_ADMIN => $viewer && self::canViewAdmin($event, $viewer),
            self::EDIT => $viewer && self::canEdit($event, $viewer),
            self::DELETE => $viewer && self::canDelete($event, $viewer),
            self::EXPORT => $viewer && self::canExport($event, $viewer),
            default => throw new \LogicException(self::class . " - Unknown attribute {$attribute}"),
        };
    }

    private function canCreateEvent(User $viewer): bool
    {
        return self::canCreate($viewer)
            || $this->manager->isActive('allow_users_to_propose_events');
    }

    private static function canViewAdmin(Event $event, User $viewer): bool
    {
        return $viewer->isAdmin() || ($viewer->isProjectAdmin() && $event->getOwner() === $viewer);
    }

    private static function canViewFront(Event $event, ?User $viewer): bool
    {
        return $event->isEnabledOrApproved()
            || ($viewer instanceof User && self::canView($event, $viewer));
    }

    private static function canExport(Event $event, User $viewer): bool
    {
        return self::isAdminOrOwnerOrMember($event, $viewer);
    }
}
