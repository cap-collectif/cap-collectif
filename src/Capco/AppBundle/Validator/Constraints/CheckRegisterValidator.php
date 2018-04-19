<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckRegisterValidator extends ConstraintValidator
{
    public function validate($object, Constraint $constraint)
    {
        if ($object->getLink()) {
            $object->setRegistrationEnable(false);
        }

        return true;
    }
}
