<?php

namespace Capco\AppBundle\Validator\Constraints;

use Doctrine\ORM\PersistentCollection;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasOnlyOneRealisationStepValidator extends ConstraintValidator
{
    /**
     * Checks if the passed value is valid.
     *
     * @param PersistentCollection $value      The value that should be validated
     * @param Constraint           $constraint The constraint for the validation
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
        return $steps->filter(
            function ($step) {
                return $step->getStep()->isRealisationStep();
            }
        )->count() > 1;
    }
}
