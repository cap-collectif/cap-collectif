<?php
namespace Capco\UserBundle\Security\Exception;

class EventAccessDeniedException extends \RuntimeException
{
    private $attributes = array();
    private $subject;

    public function __construct(
        string $message = 'Event Access Denied.',
        \Exception $previous = null
    ) {
        parent::__construct($message, 403, $previous);
    }

    /**
     * @return array
     */
    public function getAttributes()
    {
        return $this->attributes;
    }

    /**
     * @param array|string $attributes
     */
    public function setAttributes($attributes)
    {
        $this->attributes = (array) $attributes;
    }

    /**
     * @return mixed
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * @param mixed $subject
     */
    public function setSubject($subject)
    {
        $this->subject = $subject;
    }
}
