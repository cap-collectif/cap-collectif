<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

class CaptchaConstraint extends Constraint
{
    public $message = 'recaptcha.invalid';

    public function validatedBy()
    {
        return CaptchaValidator::class;
    }
}
