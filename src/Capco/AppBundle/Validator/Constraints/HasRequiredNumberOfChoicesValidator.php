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
        if ($rule && \is_array($value)) {
            $valueLength = array_key_exists('labels', $value) ? \count($value['labels']) : 0;
            $valueLength += array_key_exists('other', $value) ? 1 : 0;
            if (0 === $valueLength && !$question->isRequired()) {
                return;
            }
            if ('min' === $rule->getType() && $valueLength < $rule->getNumber()) {
                $this->context->buildViolation('response.min')
                    ->atPath('value')
                    ->setParameter('%nb%', $rule->getNumber())
                    ->addViolation();

                return;
            }
            if ('max' === $rule->getType() && $valueLength > $rule->getNumber()) {
                $this->context->buildViolation('response.max')
                    ->atPath('value')
                    ->setParameter('%nb%', $rule->getNumber())
                    ->addViolation();

                return;
            }
            if ('equal' === $rule->getType() && $valueLength !== $rule->getNumber()) {
                $this->context->buildViolation('response.equal')
                    ->atPath('value')
                    ->setParameter('%nb%', $rule->getNumber())
                    ->addViolation();

                return;
            }
        }
    }
}
