<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class CheckMapCenter extends Constraint
{
    public $message = 'check_mapcenter';

    public function validatedBy()
    {
        return CheckMapCenterValidator::class;
    }
}
