<?php

namespace Capco\AppBundle\Exception;

use Symfony\Component\HttpKernel\Exception\HttpException;

class ParisAuthenticationException extends HttpException
{
    protected $emailAddress;

    public function __construct(
        string $emailAddress,
        $message = null,
        \Exception $previous = null,
        array $headers = [],
        int $code = 0
    ) {
        parent::__construct(403, $message, $previous, $headers, $code);
        $this->emailAddress = $emailAddress;
    }

    public function getEmailAddress(): string
    {
        return $this->emailAddress;
    }
}
