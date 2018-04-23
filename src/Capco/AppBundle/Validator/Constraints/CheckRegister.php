<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class CheckRegister extends Constraint
{
    public function validatedBy()
    {
        return 'check_register.validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
