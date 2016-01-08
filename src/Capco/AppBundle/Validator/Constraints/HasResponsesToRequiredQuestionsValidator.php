<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Question;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasResponsesToRequiredQuestionsValidator extends ConstraintValidator
{
    public function validate($value, Constraint $constraint)
    {
        $responses = $value->getProposalResponses();
        $questions = $value->getProposalForm()->getQuestions();
        foreach ($questions as $question) {
            if ($question->isRequired() && !$this->hasResponseForQuestion($question, $responses)) {
                $this->context->addViolationAt('proposalResponses', $constraint->message, [], null);
                return;
            }
        }

    }

    private function hasResponseForQuestion(Question $question, $responses) {
        foreach ($responses as $response) {
            if ($response->getQuestion() === $question) {
                if ($response->getValue() && strlen($response->getValue())) {
                    return true;
                }
                return false;
            }
        }
        return false;
    }
}
