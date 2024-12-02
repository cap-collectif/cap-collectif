<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasThemeIfActivatedValidator extends ConstraintValidator
{
    public function __construct(private readonly Manager $toggleManager)
    {
    }

    public function validate($object, Constraint $constraint)
    {
        if ($this->toggleManager->isActive('themes') && null === $object) {
            $this->context->addViolation($constraint->message, []);
        }
    }
}
