<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

class ValidCustomCodeContent extends Constraint
{
    public string $message = 'custom-code-content-not-valid';

    public function validatedBy(): string
    {
        return ValidCustomCodeContentValidator::class;
    }
}
