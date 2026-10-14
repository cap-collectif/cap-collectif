<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class MaxVocalFolderSizeValidator extends MaxFolderSizeValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof MaxVocalFolderSize) {
            throw new UnexpectedTypeException($constraint, MaxVocalFolderSize::class);
        }

        $this->validateFolderSize($value, $constraint, MaxVocalFolderSize::FOLDER);
    }
}
