<?php

namespace Capco\AppBundle\Exception;

use Exception;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Class CasAuthenticationException
 *
 */
class CasAuthenticationException extends HttpException
{
    /**
     * @var string
     */
    protected string $errorCas;

    /**
     * @param string $errorCas
     * @param null $message
     * @param Exception|null $previous
     * @param array $headers
     * @param int $code
     */
    public function __construct(
        string $errorCas,
               $message = null,
        Exception $previous = null,
        array $headers = [],
        int $code = 0
    ) {
       parent::__construct(403, $message, $previous, $headers, $code);
        $this->errorCas = $errorCas;
    }

    /**
     * @return string
     */
    public function getErrorCas(): string
    {
        return $this->errorCas;
    }


}