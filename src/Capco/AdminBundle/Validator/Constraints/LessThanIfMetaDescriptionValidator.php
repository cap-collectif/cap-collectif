<?php

namespace Capco\AdminBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class LessThanIfMetaDescriptionValidator extends ConstraintValidator
{
    public function validate($object, Constraint $constraint)
    {
        if (
            $object->isSocialNetworkDescription() &&
            \strlen($object->getValue()) > $constraint->max
        ) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
