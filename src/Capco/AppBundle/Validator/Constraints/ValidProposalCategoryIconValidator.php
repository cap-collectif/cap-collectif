<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Enum\AvailableProposalCategoryIcon;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class ValidProposalCategoryIconValidator extends ConstraintValidator
{
    public function validate($icon, Constraint $constraint)
    {
        if (null === $icon) {
            return;
        }

        if (!AvailableProposalCategoryIcon::isValid($icon)) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
