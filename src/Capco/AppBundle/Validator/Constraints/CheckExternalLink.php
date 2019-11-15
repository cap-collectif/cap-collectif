<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

class CheckExternalLink extends Constraint
{
    public $message = 'available-external-link-required';

    public function validatedBy()
    {
        return CheckExternalLinkValidator::class;
    }
}
