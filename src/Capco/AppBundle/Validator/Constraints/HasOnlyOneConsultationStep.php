<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasOnlyOneConsultationStep extends Constraint
{
    public $message = 'consultation.multiple_consultation_steps';

    public function validatedBy()
    {
        return get_class($this).'Validator';
    }
}
