<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasThemeIfActivated extends Constraint
{
    public $message = 'global.no_theme_when_activated';

    public function validatedBy()
    {
        return HasThemeIfActivatedValidator::class;
    }
}
