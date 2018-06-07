<?php

namespace Capco\AppBundle\Validator\Constraints;

use EmailChecker\EmailChecker;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class NotThrowableEmailValidator extends ConstraintValidator
{
    protected $emailChecker;

    public function __construct(EmailChecker $emailChecker)
    {
        $this->emailChecker = $emailChecker;
    }

    public function validate($value, Constraint $constraint): void
    {
        if (null === $value || '' === $value) {
            return;
        }

        if (!is_scalar($value) && !(\is_object($value) && method_exists($value, '__toString'))) {
            throw new UnexpectedTypeException($value, 'string');
        }

        if (!$this->emailChecker->isValid($value)) {
            $this->context->addViolation($constraint->message);
        }
    }
}
