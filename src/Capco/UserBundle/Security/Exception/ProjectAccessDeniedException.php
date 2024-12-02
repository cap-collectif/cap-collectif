<?php

namespace Capco\UserBundle\Security\Exception;

class ProjectAccessDeniedException extends \RuntimeException
{
    private $attributes = [];
    private $subject;

    public function __construct(
        string $message = 'Project Access Denied.',
        ?\Exception $previous = null
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

    public function setSubject(mixed $subject)
    {
        $this->subject = $subject;
    }
}
