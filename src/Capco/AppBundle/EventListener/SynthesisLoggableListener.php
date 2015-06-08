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
     * @param mixed $username
     *
     * @throws \Gedmo\Exception\InvalidArgumentException Invalid username
     */
    public function setUsername($username)
    {
        // In case we get JWT Token
        if (is_object($username) && method_exists($username, 'getUser')) {
            $username = $username->getUser();
        }

        if (is_object($username) && method_exists($username, 'getSlug')) {
            $this->username = (string) $username->getSlug();
        } else {
            throw new \Gedmo\Exception\InvalidArgumentException('Username must be a User with getSlug method or a JWTToken object');
        }
    }
}
