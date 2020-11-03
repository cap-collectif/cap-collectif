<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckColorValidator extends ConstraintValidator
{
    public function validate($color, Constraint $constraint)
    {
        if (null === $color) {
            return;
        }

        // Real regex is the following '/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'
        // but we let color string between 3 and 6 for possible conflict purpose
        if (!preg_match('/^#[A-Fa-f0-9]{3,6}$/', $color)) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
