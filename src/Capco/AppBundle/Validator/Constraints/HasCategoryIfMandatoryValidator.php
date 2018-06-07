<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasCategoryIfMandatoryValidator extends ConstraintValidator
{
    public function validate($object, Constraint $constraint)
    {
        $form = $object->getProposalForm();
        if (!$object->getCategory() && $form && \count($form->getCategories()) > 0 && $form->isUsingCategories() && $form->isCategoryMandatory()) {
            $this->context
                ->buildViolation($constraint->message)
                ->addViolation()
            ;

            return false;
        }

        return true;
    }
}
