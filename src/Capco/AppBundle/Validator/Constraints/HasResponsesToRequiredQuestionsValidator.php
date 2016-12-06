<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\PropertyAccess\PropertyAccess;

class HasResponsesToRequiredQuestionsValidator extends ConstraintValidator
{
    public function validate($object, Constraint $constraint)
    {
        $accessor = PropertyAccess::createPropertyAccessor();
        $responses = $object->getResponses();
        $form = $accessor->getValue($object, $constraint->formField);
        $questions = $form->getQuestions();
        foreach ($questions as $qaq) {
            $question = $qaq->getQuestion();
            if ($question->isRequired() && !$this->hasResponseForQuestion($question, $responses)) {
                $this->context->addViolationAt('responses', $constraint->message, [], null);

                return;
            }
        }
    }

    private function hasResponseForQuestion(AbstractQuestion $question, $responses)
    {
        foreach ($responses as $response) {
            if ($response->getQuestion() === $question) {
                $value = $response->getValue();
                if (is_array($value) && count($value)) {
                    return true;
                }
                if (is_string($value) && strlen($value)) {
                    return true;
                }

                return false;
            }
        }

        return false;
    }
}
