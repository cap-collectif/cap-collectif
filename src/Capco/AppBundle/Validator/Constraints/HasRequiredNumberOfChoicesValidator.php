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
            $valueLength = array_key_exists('labels', $value) ? count($value['labels']) : 0;
            $valueLength += array_key_exists('other', $value) ? 1 : 0;
            if ($valueLength === 0 && !$question->isRequired()) {
                return;
            }
            if ($rule->getType() === 'min' && $valueLength < $rule->getNumber()) {
                $this->context->addViolationAt('value', 'response.min', ['%nb%' => $rule->getNumber()], null);

                return;
            }
            if ($rule->getType() === 'max' && $valueLength > $rule->getNumber()) {
                $this->context->addViolationAt('value', 'response.max', ['%nb%' => $rule->getNumber()], null);

                return;
            }
            if ($rule->getType() === 'equal' && $valueLength !== $rule->getNumber()) {
                $this->context->addViolationAt('value', 'response.equal', ['%nb%' => $rule->getNumber()], null);

                return;
            }
        }
    }
}
