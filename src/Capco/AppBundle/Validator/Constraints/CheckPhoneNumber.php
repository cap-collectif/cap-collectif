<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Enum\UserPhoneErrors;
use Symfony\Component\Validator\Constraint;

class CheckPhoneNumber extends Constraint
{
    public string $alreadyUsedMessage = UserPhoneErrors::PHONE_ALREADY_USED_BY_ANOTHER_USER;
    public string $invalidLength = UserPhoneErrors::PHONE_INVALID_LENGTH;

    public function validatedBy(): string
    {
        return \get_class($this) . 'Validator';
    }
}
