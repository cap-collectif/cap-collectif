<?php

namespace Capco\UserBundle\Listener;

use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use FOS\UserBundle\Util\TokenGeneratorInterface;

class UserNotificationsListener
{
    public function __construct(private readonly TokenGeneratorInterface $tokenGenerator)
    {
    }

    public function prePersist(UserNotificationsConfiguration $userNotificationsConfiguration)
    {
        if (!$userNotificationsConfiguration->getUnsubscribeToken()) {
            $userNotificationsConfiguration->setUnsubscribeToken(
                $this->tokenGenerator->generateToken()
            );
        }
    }
}
