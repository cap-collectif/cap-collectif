<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasAuthorValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint)
    {
        if (method_exists($value, 'getAuthor') && !$value->getAuthor()) {
            $path = method_exists($value, 'getUser') && $value->getUser() ? 'user' : 'author';
            $this->context
                ->buildViolation($constraint->message)
                ->atPath($path)
                ->addViolation();
        }
    }
}
