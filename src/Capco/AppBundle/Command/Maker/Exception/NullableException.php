<?php

namespace Capco\AppBundle\Command\Maker\Exception;

use Throwable;

class NullableException extends \RuntimeException
{
    public function __construct(
        string $message = 'Expected a non nullable value, but got null',
        int $code = 0,
        ?Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
