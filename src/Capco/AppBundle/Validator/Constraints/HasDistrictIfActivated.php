<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasDistrictIfActivated extends Constraint
{
    public $message = 'global.no_district_when_activated';

    public function validatedBy()
    {
        return 'has_district_if_activated.validator';
    }
}
