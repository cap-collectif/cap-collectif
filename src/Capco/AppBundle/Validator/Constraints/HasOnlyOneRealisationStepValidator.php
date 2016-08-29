<?php

namespace Capco\AppBundle\Validator\Constraints;

use Doctrine\ORM\PersistentCollection;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

class HasOnlyOneRealisationStepValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint) : bool
    {
        // Convert a ProjectAbstractStep collection to an AbstractStep collection with phpspec fallback
        // https://github.com/phpspec/phpspec/issues/991
        // TODO: Fixme by removing ProjectAbstractStep and use an AbstractStep collection instead
        $steps = $value instanceof Collection ? $value->map(function($pas) { return $pas->getStep(); }) : new ArrayCollection($value);

        if ($this->hasRealisationStep($steps)) {
            $this->context
                ->buildViolation($constraint->message)
                ->atPath('project')
                ->addViolation();

            return false;
        }

        return true;
    }

    public function hasRealisationStep(ArrayCollection $steps) : bool
    {
        return $steps->filter(
            function ($step) {
                return $step->isRealisationStep();
            }
        )->count() > 1;
    }
}
