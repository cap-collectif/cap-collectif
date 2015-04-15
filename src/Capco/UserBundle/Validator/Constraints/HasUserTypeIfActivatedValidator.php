<?php

namespace Capco\UserBundle\Validator\Constraints;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasUserTypeIfActivatedValidator extends ConstraintValidator
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function validate($object, Constraint $constraint)
    {
        if ($this->toggleManager->isActive('user_type') && null == $object) {
            $this->context->addViolation($constraint->message, array());
        }
    }
}
