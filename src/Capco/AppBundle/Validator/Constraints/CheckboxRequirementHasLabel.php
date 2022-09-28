<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class CheckboxRequirementHasLabel extends Constraint
{
    public $message = 'checkbox_no_label';

    public function validatedBy()
    {
        return CheckboxRequirementHasLabelValidator::class;
    }
}
