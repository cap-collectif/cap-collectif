<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasLocationIfMandatoryValidator extends ConstraintValidator
{
    public function validate($object, Constraint $constraint): bool
    {
        $form = $object->getProposalForm();

        if ($form->getUsingAddress() && !$object->getLocation()) {
            $this->context
                ->buildViolation($constraint->message)
                ->addViolation();

            return false;
        }

        return true;
    }
}
