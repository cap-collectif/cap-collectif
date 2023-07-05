<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasAnonymousOrUser extends Constraint
{
    public $message = 'event_registration.create.no_user_error';

    public function validatedBy()
    {
        return static::class . 'Validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
