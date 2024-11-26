<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class CheckIdentificationCode extends Constraint
{
    final public const BAD_CODE = 'BAD_CODE';
    final public const CODE_ALREADY_USED = 'CODE_ALREADY_USED';

    public $message = self::BAD_CODE;
    public $messageUsed = self::CODE_ALREADY_USED;

    public function validatedBy()
    {
        return CheckIdentificationCodeValidator::class;
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
