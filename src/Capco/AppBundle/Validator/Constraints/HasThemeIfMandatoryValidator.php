<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasThemeIfMandatoryValidator extends ConstraintValidator
{
    public function __construct(private readonly Manager $toggleManager)
    {
    }

    public function validate($object, Constraint $constraint)
    {
        $form = $object->getProposalForm();
        if (
            !$object->getTheme()
            && $this->toggleManager->isActive('themes')
            && $form
            && $form->isUsingThemes()
            && $form->isThemeMandatory()
        ) {
            $this->context->buildViolation($constraint->message)->addViolation();

            return false;
        }

        return true;
    }
}
