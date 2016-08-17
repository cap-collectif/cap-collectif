<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class ProjectStepDoNotOverlapValidator extends ConstraintValidator
{
    private function stepsDoNotOverlap($steps)
    {
        foreach ($steps as $ps) {
            $step = $ps->getStep();

            if ($step) {
                $startAt = $step->getStartAt();
                $endAt = $step->getEndAt();

                foreach ($steps as $value) {
                    $currentStep = $value->getStep();

                    if ($currentStep) {
                        $currentStartAt = $currentStep->getStartAt();
                        $currentEndAt = $currentStep->getEndAt();

                        if ($step != $currentStep) {
                            if (($currentEndAt < $startAt) || ($currentStartAt > $endAt)) {
                                continue;
                            } else {
                                return false;
                            }
                        }
                    }
                }
            }
        }

        return true;
    }

    /**
     * @param $steps
     * @param Constraint $constraint
     *
     * @return bool
     */
    public function validate($steps, Constraint $constraint)
    {
        if ($steps && count($steps) > 1 && !$this->stepsDoNotOverlap($steps)) {
            $this->context
                ->buildViolation($constraint->message)
                ->addViolation()
            ;

            return false;
        }

        return true;
    }
}
