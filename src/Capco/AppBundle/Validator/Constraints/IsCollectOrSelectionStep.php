<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class IsCollectOrSelectionStep extends Constraint
{
    public $message = 'global.is_not_collect_nor_selection_step';

    public function validatedBy()
    {
        return static::class . 'Validator';
    }
}
