<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasValidAddress extends Constraint
{
    public $message = 'sorry-that-address-could-not-be-found';

    public function validatedBy()
    {
        return HasValidAddressValidator::class;
    }

    public function getTargets()
    {
        return [self::CLASS_CONSTRAINT, self::PROPERTY_CONSTRAINT];
    }
}
