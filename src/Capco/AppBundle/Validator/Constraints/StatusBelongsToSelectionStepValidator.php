<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class StatusBelongsToSelectionStepValidator extends ConstraintValidator
{
    public function validate($protocol, Constraint $constraint)
    {
        $step = $protocol->getSelectionStep();
        $status = $protocol->getStatus();
        if ($step && $status && $status->getStep() !== $step) {
            $this->context
                ->buildViolation($constraint->message)
                ->atPath('status')
                ->addViolation()
            ;
        }
    }
}
