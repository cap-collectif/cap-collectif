<?php

namespace Capco\AppBundle\EventListener;

use Gedmo\Loggable\LoggableListener;

class SynthesisLoggableListener extends LoggableListener
{
    /**
     * Set username for identification.
     *
     * We use slug instead of username because username is not unique in our model
     *
     * @param mixed $user
     *
     * @throws \Gedmo\Exception\InvalidArgumentException Invalid user
     */
    public function setUsername($user)
    {
        // In case we get JWT Token
        if (\is_object($user) && method_exists($user, 'getUser')) {
            $user = $user->getUser();
        }

        if (\is_object($user) && method_exists($user, 'getSlug')) {
            $this->username = (string) $user->getSlug();
        } else {
            throw new \Gedmo\Exception\InvalidArgumentException(
                'User must have a getSlug method or a JWTToken object'
            );
        }
    }
}
