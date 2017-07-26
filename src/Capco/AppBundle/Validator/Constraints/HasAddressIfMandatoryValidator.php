<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasAddressIfMandatoryValidator extends ConstraintValidator
{
    public function validate($object, Constraint $constraint): bool
    {
        $form = $object->getProposalForm();

        if ($form->getUsingAddress() && !$object->getAddress()) {
            $this->context
                ->buildViolation($constraint->message)
                ->addViolation();

            return false;
        }

        return true;
    }
}
