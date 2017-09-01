<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Helper\GeometryHelper;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasAddressIfMandatoryValidator extends ConstraintValidator
{
    public function validate($object, Constraint $constraint): bool
    {
        $form = $object->getProposalForm();

        if (!$form->getUsingAddress()) {
            return true;
        }

        $address = $object->getAddress();
        if (!$address) {
            $this->context
                ->buildViolation($constraint->message)
                ->addViolation();

            return false;
        }

        if (!$form->isProposalInAZoneRequired()) {
            return true;
        }

        // foreach ($districts as $district) {
          if (GeometryHelper::isIncluded(0, 0, '')) {
              return true;
          }
        // }

        // "Adresse est hors périmètre. Veuillez saisir une adresse se situant dans le périmètre du projet"
        $this->context
              ->buildViolation($constraint->message)
              ->addViolation();

        return false;
    }
}
