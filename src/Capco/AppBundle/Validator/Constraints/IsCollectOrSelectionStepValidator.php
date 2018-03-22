<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class IsCollectOrSelectionStepValidator extends ConstraintValidator
{
    public function validate($object, Constraint $constraint)
    {
        if (!$object->isSelectionStep() && !$object->isCollectStep()) {
            $this->context->addViolation($constraint->message, []);
        }
    }
}
