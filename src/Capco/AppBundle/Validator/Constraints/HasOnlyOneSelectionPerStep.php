<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasOnlyOneSelectionPerStep extends Constraint
{
    public $message = 'proposal.more_than_one_selection_per_step';

    public function validatedBy()
    {
        return \get_class($this) . 'Validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
