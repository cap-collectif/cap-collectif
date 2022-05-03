<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventRegistration;
use Capco\UserBundle\Entity\User;

class EventHelper
{
    public function isRegistrationPossible(Event $event): bool
    {
        return $event->canContribute() &&
            $event->isFuture() &&
            $event->isGuestListEnabled() &&
            null === $event->getLink();
    }

    public function isCompleteAndRegistrationPossibleResolver(Event $event): bool
    {
        return $this->isRegistrationPossible($event) && $event->isRegistrationComplete();
    }

    public function findUserRegistrationOrCreate(
        Event $event,
        ?User $user = null
    ): EventRegistration {
        if (null === $user) {
            return new EventRegistration($event);
        }

        foreach ($event->getRegistrations() as $registration) {
            if ($registration->getUser() === $user) {
                return $registration;
            }
        }

        return new EventRegistration($event);
    }
}
