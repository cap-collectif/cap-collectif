<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasUnlistedEmail extends Constraint
{
    public $message = 'event_registration.create.listed_email';

    public function validatedBy()
    {
        return 'unlisted_email.validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
