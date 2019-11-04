<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

class CheckExternalLink extends Constraint
{
    public $message = 'You must specify an external Link.';

    public function validatedBy()
    {
        return CheckExternalLinkValidator::class;
    }
}
