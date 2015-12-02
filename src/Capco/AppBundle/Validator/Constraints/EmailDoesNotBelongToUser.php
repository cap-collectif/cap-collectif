<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class EmailDoesNotBelongToUser extends Constraint
{
    public $message = 'email.email_belongs_to_user';

    public function validatedBy()
    {
        return 'email_belongs_not.validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
