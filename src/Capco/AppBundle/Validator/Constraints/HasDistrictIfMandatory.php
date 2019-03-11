<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasDistrictIfMandatory extends Constraint
{
    public $message = 'global.no_district_when_mandatory';

    public function validatedBy()
    {
        return HasDistrictIfMandatoryValidator::class;
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
