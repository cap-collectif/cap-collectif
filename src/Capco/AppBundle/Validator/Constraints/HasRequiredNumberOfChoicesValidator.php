<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasRequiredNumberOfChoicesValidator extends ConstraintValidator
{
    public function validate($object, Constraint $constraint)
    {
        $question = $object->getQuestion();
        if (!$question instanceof MultipleChoiceQuestion) {
            return;
        }
        $rule = $question->getValidationRule();
        $value = $object->getValue();
        if ($rule && is_array($value)) {
            if (count($value) === 0 && !$question->isRequired()) {
                return;
            }
            if ($rule->getType() === 'min' && count($value) < $rule->getNumber()) {
                $this->context->addViolationAt('value', 'response.min', ['%nb%' => $rule->getNumber()], null);
                return;
            }
            if ($rule->getType() === 'max' && count($value) > $rule->getNumber()) {
                $this->context->addViolationAt('value', 'response.max', ['%nb%' => $rule->getNumber()], null);
                return;
            }
            if ($rule->getType() === 'equal' && count($value) !== $rule->getNumber()) {
                $this->context->addViolationAt('value', 'response.equal', ['%nb%' => $rule->getNumber()], null);
                return;
            }
        }
        return;
    }
}
