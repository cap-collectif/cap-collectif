<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Enum\UserPhoneErrors;
use Symfony\Component\Validator\Constraint;

class CheckPhoneNumber extends Constraint
{
    public string $invalidLength = UserPhoneErrors::PHONE_INVALID_LENGTH;
    public string $mobilePhone = UserPhoneErrors::PHONE_SHOULD_BE_MOBILE_NUMBER;

    public function validatedBy(): string
    {
        return CheckPhoneNumberValidator::class;
    }
}
