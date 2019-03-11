<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

class ReCaptchaConstraint extends Constraint
{
    public $message = 'recaptcha.invalid';

    public function validatedBy()
    {
        return ReCaptchaValidator::class;
    }
}
