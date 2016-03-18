<?php

namespace Capco\AppBundle\Validator\Constraint;

use Symfony\Component\Validator\Constraint;

class ReCaptchaConstraint extends Constraint
{
    public $message = 'recaptcha.invalid';

    public function validatedBy()
    {
        return 'recaptcha.validator';
    }
}
