<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasAnonymousOrUserValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint)
    {
        if ((null == $value->getUsername() || null == $value->getEmail()) && null == $value->getUser()) {
            $this->context->addViolationAt('username', $constraint->message, [], null);
        }
    }
}
