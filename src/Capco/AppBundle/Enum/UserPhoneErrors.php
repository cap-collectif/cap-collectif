<?php

namespace Capco\AppBundle\Enum;

final class UserPhoneErrors
{
    public const PHONE_SHOULD_BE_MOBILE_NUMBER = 'PHONE_SHOULD_BE_MOBILE_NUMBER';
    public const PHONE_ALREADY_USED_BY_ANOTHER_USER = 'PHONE_ALREADY_USED_BY_ANOTHER_USER';
    public const PHONE_INVALID_LENGTH = 'PHONE_INVALID_LENGTH';
}
