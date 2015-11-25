<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class ConsultationStepExistsValidator extends ConstraintValidator
{
    public function validate($protocol, Constraint $constraint)
    {
        if ($protocol->getSourceType() === 'consultation_step' && !$protocol->getConsultationStep()) {
            $this->context->addViolationAt('consultationStep', $constraint->message, array(), null);
        }
    }
}
