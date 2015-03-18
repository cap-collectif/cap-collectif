<?php

namespace Capco\AppBundle\Helper;

use Capco\UserBundle\Entity\User;

class VoteHelper
{
    public function findUserRegistrationOrCreate(Event $event, User $user = null)
    {
        if ($user == null) {
            return new EventRegistration($event);
        }

        foreach ($event->getRegistrations() as $registration) {
            if ($registration->getUser() == $user) {
                return $registration;
            }
        }

        return new EventRegistration($event);
    }
}
