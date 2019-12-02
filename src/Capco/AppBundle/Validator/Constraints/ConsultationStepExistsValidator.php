<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class ConsultationStepExistsValidator extends ConstraintValidator
{
    public function validate($protocol, Constraint $constraint)
    {
        if ('global.consultation' === $protocol->getSourceType() && !$protocol->getConsultationStep()) {
            $this->context->buildViolation($constraint->message)
                ->atPath('consultationStep')
                ->addViolation();
        }
    }
}
