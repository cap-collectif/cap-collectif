<?php

namespace Capco\AppBundle\Enum;

class SendSMSErrorCode
{
    public const INVALID_NUMBER = 'INVALID_NUMBER';
    public const SERVER_ERROR = 'SERVER_ERROR';
    public const RETRY_LIMIT_REACHED = 'RETRY_LIMIT_REACHED';
    public const PHONE_ALREADY_CONFIRMED = 'PHONE_ALREADY_CONFIRMED';
}
