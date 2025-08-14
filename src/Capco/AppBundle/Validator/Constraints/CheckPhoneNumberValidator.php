<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckPhoneNumberValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint): void
    {
        if (!$value) {
            return;
        }
        $this->validateNumberLength($value, $constraint);
        $this->validateMobilePhoneNumber($value, $constraint);
    }

    private function validateNumberLength(string $phone, Constraint $constraint): void
    {
        $phoneMaxLength = 12; // +33 and 9 digits
        if (\strlen($phone) !== $phoneMaxLength) {
            $this->context->buildViolation($constraint->invalidLength)->addViolation();
        }
    }

    private function validateMobilePhoneNumber(string $phone, Constraint $constraint): void
    {
        if (!preg_match('/^\+33[67]/', $phone)) {
            $this->context->buildViolation($constraint->mobilePhone)->addViolation();
        }
    }
}
