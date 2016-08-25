<?php

namespace Capco\AppBundle\Validator\Constraints;

use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasOnlyOneRealisationStepValidator extends ConstraintValidator
{
    /**
     * Checks if the passed value is valid.
     *
     * @param ArrayCollection $value      The value that should be validated
     * @param Constraint      $constraint The constraint for the validation
     *
     * @return bool
     */
    public function validate($value, Constraint $constraint) : bool
    {
        if ($this->hasRealisationStep($value)) {
            $this->context
                ->buildViolation($constraint->message)
                ->atPath('project')
                ->addViolation();
            return false;
        }

        return true;
    }

    public function hasRealisationStep($steps) : bool
    {
        return $steps->exists(function($key, $step) {
            return $step->getStep()->isRealisationStep();
        });
    }
}
