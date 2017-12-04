<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasAuthorValidator extends ConstraintValidator
{
    public function validate($protocol, Constraint $constraint)
    {
        $author = $protocol->getAuthor();
        if ((null === $protocol->getAuthorName() || null === $protocol->getAuthorEmail()) && null === $protocol->getAuthor()) {
            $this->context->buildViolation($constraint->message)
                ->atPath('authorName')
                ->addViolation();
        }
    }
}
