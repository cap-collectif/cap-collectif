<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasAddressIfMandatory extends Constraint
{
    public $noAddressMessage = 'global.no_address_when_mandatory';
    public $noValidJsonAddressMessage = 'global.no_valid_json_address';
    public $addressNotInZoneMessage = 'global.address_not_in_zone';

    public function validatedBy(): string
    {
        return HasAddressIfMandatoryValidator::class;
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
