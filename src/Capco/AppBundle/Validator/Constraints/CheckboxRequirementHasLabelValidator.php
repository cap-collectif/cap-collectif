<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Requirement;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckboxRequirementHasLabelValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint)
    {
        foreach ($value as $requirement) {
            if (self::checkboxRequirementWithoutLabel($requirement)) {
                $this->context->buildViolation($constraint->message)->addViolation();

                return;
            }
        }
    }

    private static function checkboxRequirementWithoutLabel(Requirement $requirement): bool
    {
        return Requirement::CHECKBOX === $requirement->getType() && !self::hasLabel($requirement);
    }

    private static function hasLabel(Requirement $requirement): bool
    {
        return $requirement->getLabel() && !empty($requirement->getLabel());
    }
}
