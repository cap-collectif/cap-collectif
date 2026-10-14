<?php

namespace Capco\AppBundle\Exception;

final class VocalContributionUploadException extends \RuntimeException
{
    public function __construct(
        public readonly string $errorCode,
        public readonly int $statusCode
    ) {
        parent::__construct($errorCode);
    }
}
