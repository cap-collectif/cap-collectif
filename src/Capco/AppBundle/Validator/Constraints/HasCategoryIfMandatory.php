<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasCategoryIfMandatory extends Constraint
{
    public $message = 'global.no_category_when_mandatory';

    public function validatedBy()
    {
        return 'has_category_if_mandatory.validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
