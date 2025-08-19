<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

class MaxFolderSize extends Constraint
{
    public string $message = 'global.error.server.form';

    public function validatedBy(): string
    {
        return static::class . 'Validator';
    }
}
