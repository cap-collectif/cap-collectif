<?php

namespace Capco\UserBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasUserTypeIfActivated extends Constraint
{
    public $message = 'user.no_user_type_when_activated';

    public function validatedBy()
    {
        return 'has_user_type_if_activated.validator';
    }
}
