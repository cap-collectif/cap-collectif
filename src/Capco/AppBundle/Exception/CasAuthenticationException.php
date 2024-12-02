<?php

namespace Capco\AppBundle\Exception;

use Exception;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Class CasAuthenticationException.
 */
class CasAuthenticationException extends HttpException
{
    /**
     * @param null $message
     */
    public function __construct(
        protected string $errorCas,
        $message = null,
        ?Exception $previous = null,
        array $headers = [],
        int $code = 0
    ) {
        parent::__construct(403, $message, $previous, $headers, $code);
    }

    public function getErrorCas(): string
    {
        return $this->errorCas;
    }
}
