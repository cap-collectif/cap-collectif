<?php

namespace Capco\AppBundle\Enum;

class VerifySMSErrorCode
{
    public const PHONE_ALREADY_CONFIRMED = 'PHONE_ALREADY_CONFIRMED';
    public const CODE_EXPIRED = 'CODE_EXPIRED';
    public const CODE_NOT_VALID = 'CODE_NOT_VALID';
    public const RETRY_LIMIT_REACHED = 'RETRY_LIMIT_REACHED';
    public const SERVER_ERROR = 'SERVER_ERROR';
}
