<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class NotThrowableEmail extends Constraint
{
    public $message = 'email.throwable';

    public function validatedBy(): string
    {
        return 'capco.not_throwable_email.validator';
    }
}
