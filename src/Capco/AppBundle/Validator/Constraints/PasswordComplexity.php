<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

class PasswordComplexity extends Constraint
{
    public $message = 'fos_user.password.not_current';

    public function validatedBy()
    {
        return PasswordComplexityValidator::class;
    }
}
