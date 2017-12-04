<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class EndAfterStartValidator extends ConstraintValidator
{
    public function validate($protocol, Constraint $constraint)
    {
        if (null !== $protocol->getEndAt() && null !== $protocol->getStartAt() && $protocol->getEndAt() < $protocol->getStartAt()) {
            $this->context->buildViolation($constraint->message)
                ->atPath('endAt')
                ->addViolation();
        }
    }
}
