<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class EventVoter extends AbstractOwnerableVoter
{
    public const CREATE = 'create';
    public const VIEW_FRONT = 'viewFront';
    public const VIEW_ADMIN = 'viewAdmin';
    public const EDIT = 'edit';
    public const DELETE = 'delete';
    public const EXPORT = 'export';

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
                return $viewer && $this->canCreateEvent($viewer);

            case self::VIEW_FRONT:
                return self::canViewFront($event, $viewer);

            case self::VIEW_ADMIN:
                return $viewer && self::canViewAdmin($event, $viewer);

            case self::EDIT:
                return $viewer && self::canEdit($event, $viewer);

            case self::DELETE:
                return $viewer && self::canDelete($event, $viewer);

            case self::EXPORT:
                return $viewer && self::canExport($event, $viewer);
        }

        throw new \LogicException(self::class . " - Unknown attribute {$attribute}");
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
