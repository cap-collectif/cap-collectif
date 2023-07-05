<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasOnlyOneSelectionStepAllowingProgressStepsValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint): bool
    {
        // Convert a ProjectAbstractStep collection to an AbstractStep collection with phpspec fallback
        // https://github.com/phpspec/phpspec/issues/991
        // TODO: Fixme by removing ProjectAbstractStep and use an AbstractStep collection instead
        if ($value instanceof Collection) {
            $steps =
                0 === $value->count()
                    ? $value
                    : $value->filter(function ($pas) {
                        return null !== $pas;
                    });
            $steps =
                0 === $steps->count()
                    ? $steps
                    : $steps->map(function (ProjectAbstractStep $pas) {
                        return $pas->getStep();
                    });
        } else {
            $steps = (new ArrayCollection($value))->filter(function ($pas) {
                return null !== $pas;
            });
        }

        if ($this->hasMoreThanOneSelectionStepAllowingProgressSteps($steps)) {
            $this->context
                ->buildViolation($constraint->message)
                ->atPath('project')
                ->addViolation()
            ;

            return false;
        }

        return true;
    }

    public function hasMoreThanOneSelectionStepAllowingProgressSteps(Collection $steps): bool
    {
        return $steps->count() > 0
            && $steps
                ->filter(function (?AbstractStep $step) {
                    return $step && $step->isSelectionStep() && $step->isAllowingProgressSteps();
                })
                ->count() > 1;
    }
}
