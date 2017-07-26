<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasAddressIfMandatory extends Constraint
{
    public $message = 'global.no_address_when_mandatory';

    public function validatedBy(): string
    {
        return 'has_address_if_mandatory.validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
