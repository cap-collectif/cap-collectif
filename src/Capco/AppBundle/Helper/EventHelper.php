<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventRegistration;
use Capco\UserBundle\Entity\User;

class EventHelper
{
    public function isRegistrationPossible(Event $event)
    {
        return $event->canContribute() && $event->isFuture() && $event->isRegistrationEnable() && null === $event->getLink();
    }

    public function findUserRegistrationOrCreate(Event $event, User $user = null)
    {
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
