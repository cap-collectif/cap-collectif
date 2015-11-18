<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasAuthorValidator extends ConstraintValidator
{
    public function validate($protocol, Constraint $constraint)
    {
        if ((null == $protocol->getAuthorName() || null == $protocol->getAuthorEmail()) && null == $protocol->getAuthor()) {
            $this->context->addViolationAt('authorName', $constraint->message, array(), null);
        }
    }
}
