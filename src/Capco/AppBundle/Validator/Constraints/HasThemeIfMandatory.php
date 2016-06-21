<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasThemeIfMandatory extends Constraint
{
    public $message = 'global.no_theme_when_mandatory';

    public function validatedBy()
    {
        return 'has_theme_if_mandatory.validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
