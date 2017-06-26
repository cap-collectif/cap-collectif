<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasLocationIfMandatory extends Constraint
{
    public $message = 'global.no_location_when_mandatory';

    public function validatedBy(): string
    {
        return 'has_location_if_mandatory.validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
