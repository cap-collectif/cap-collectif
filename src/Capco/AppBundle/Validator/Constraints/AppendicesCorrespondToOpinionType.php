<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class AppendicesCorrespondToOpinionType extends Constraint
{
    public $message = 'opinion.wrong_appendices';

    public function validatedBy()
    {
        return static::class . 'Validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
