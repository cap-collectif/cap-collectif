<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasOnlyOneConsultationStepValidator extends ConstraintValidator
{
    public function validate($steps, Constraint $constraint)
    {
        $multiple = false;
        foreach ($steps as $step) {
            if ($step->isConsultationStep()) {
                if ($multiple) {
                    $this->context->addViolationAt('Steps', $constraint->message, array(), null);

                    return;
                } else {
                    $multiple = true;
                }
            }
        }
    }
}
