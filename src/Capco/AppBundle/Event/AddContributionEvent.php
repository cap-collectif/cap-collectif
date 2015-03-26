<?php

namespace Capco\AppBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use Capco\UserBundle\Entity\User;

class AddContributionEvent extends Event
{
    public function __construct(User $user = null)
    {
        $this->user = $user;
    }

    public function getUser()
    {
        return $this->user;
    }
}
