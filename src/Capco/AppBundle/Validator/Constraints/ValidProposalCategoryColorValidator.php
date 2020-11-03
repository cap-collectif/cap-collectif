<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Enum\AvailableProposalCategoryColor;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class ValidProposalCategoryColorValidator extends ConstraintValidator
{
    public function validate($color, Constraint $constraint)
    {
        if (null === $color || !AvailableProposalCategoryColor::isValid($color)) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
