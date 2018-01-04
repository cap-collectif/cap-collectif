<?php

namespace Capco\AdminBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class LessThanIfMetaDescription extends Constraint
{
    public $message = 'argument.metadescription.max_length';
    public $max = 160;

    public function validatedBy()
    {
        return \get_class($this) . 'Validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
