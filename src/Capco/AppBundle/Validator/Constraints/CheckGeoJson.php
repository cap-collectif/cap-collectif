<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class CheckGeoJson extends Constraint
{
    public $message = 'check_geojson';

    public function validatedBy()
    {
        return CheckGeoJsonValidator::class;
    }
}
