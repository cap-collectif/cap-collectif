<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckMapCenterValidator extends ConstraintValidator
{
    public function validate($string, Constraint $constraint)
    {
        if (null === $string) {
            return;
        }
        $decoded = json_decode((string) $string, true);
        if (
            $decoded
            && isset($decoded[0])
            && \is_array($decoded[0])
            && self::isValidMapCenter($decoded[0])
        ) {
            return;
        }

        $this->context->buildViolation($constraint->message)->addViolation();
    }

    public static function isValidMapCenter(array $address): bool
    {
        return isset($address['geometry'])
            && isset($address['geometry']['location_type'])
            && \is_string($address['geometry']['location_type'])
            && isset($address['geometry']['location'], $address['geometry']['location']['lat'])
            && is_numeric($address['geometry']['location']['lat'])
            && isset($address['geometry']['location']['lng'])
            && is_numeric($address['geometry']['location']['lng']);
    }
}
