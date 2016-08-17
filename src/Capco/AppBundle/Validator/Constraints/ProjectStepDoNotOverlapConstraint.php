<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class ProjectStepDoNotOverlapConstraint extends Constraint
{
    public $message = 'global.steps_do_not_overlap';

    public function validatedBy()
    {
        return 'project_step_do_not_overlap.validator';
    }
}
