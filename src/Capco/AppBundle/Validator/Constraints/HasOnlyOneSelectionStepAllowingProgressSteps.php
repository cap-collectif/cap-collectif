<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasOnlyOneSelectionStepAllowingProgressSteps extends Constraint
{
    public $message = 'global.only_one_realisation_step';

    public function validatedBy()
    {
        return get_class($this) . 'Validator';
    }
}
