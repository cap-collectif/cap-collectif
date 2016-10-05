<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

class ProjectStepDoNotOverlapValidator extends ConstraintValidator
{
    private function stepsDoNotOverlap(Collection $steps)
    {
        foreach ($steps as $step) {
            $startAt = $step->getStartAt();
            $endAt = $step->getEndAt();
            foreach ($steps as $currentStep) {
                if ($step != $currentStep && $currentStep->getEndAt() >= $startAt && $currentStep->getStartAt() <= $endAt) {
                    return false;
                }
            }
        }

        return true;
    }

    public function validate($value, Constraint $constraint)
    {
        // Convert a ProjectAbstractStep collection to an AbstractStep collection with phpspec fallback
        // https://github.com/phpspec/phpspec/issues/991
        // TODO: Fixme by removing ProjectAbstractStep and use an AbstractStep collection instead
        $steps = $value instanceof Collection ? $value->map(function ($pas) {
            return $pas->getStep();
        }) : new ArrayCollection($value);

        if ($steps && $steps->count() > 1 && !$this->stepsDoNotOverlap($steps)) {
            $this->context
                ->buildViolation($constraint->message)
                ->addViolation()
            ;
        }
    }
}
