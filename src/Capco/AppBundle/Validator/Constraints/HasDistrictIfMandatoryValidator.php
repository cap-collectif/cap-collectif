<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasDistrictIfMandatoryValidator extends ConstraintValidator
{
    public function __construct(
        private readonly Manager $toggleManager
    ) {
    }

    public function validate($object, Constraint $constraint)
    {
        if ($object->getDistrict()) {
            return;
        }

        if (
            $this->toggleManager->isActive('districts')
            && $object->getProposalForm()->isUsingDistrict()
            && $object->getProposalForm()->isDistrictMandatory()
        ) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
