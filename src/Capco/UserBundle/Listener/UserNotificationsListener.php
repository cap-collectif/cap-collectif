<?php

namespace Capco\UserBundle\Listener;

use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use FOS\UserBundle\Util\TokenGeneratorInterface;

class UserNotificationsListener
{
    private $tokenGenerator;

    public function __construct(TokenGeneratorInterface $tokenGenerator)
    {
        $this->tokenGenerator = $tokenGenerator;
    }

    public function prePersist(UserNotificationsConfiguration $userNotificationsConfiguration)
    {
        $userNotificationsConfiguration->setUnsubscribeToken($this->tokenGenerator->generateToken());
    }
}
