<?php

namespace Capco\UserBundle\Security\Exception;

class EventAccessDeniedException extends \RuntimeException
{
    private $attributes = [];
    private $subject;

    public function __construct(
        string $message = 'Event Access Denied.',
        \Exception $previous = null
    ) {
        parent::__construct($message, 403, $previous);
    }

    public function getAttributes()
    {
        return $this->attributes;
    }

    public function setAttributes($attributes)
    {
        $this->attributes = (array) $attributes;
    }

    public function getSubject()
    {
        return $this->subject;
    }

    public function setSubject($subject)
    {
        $this->subject = $subject;
    }
}
