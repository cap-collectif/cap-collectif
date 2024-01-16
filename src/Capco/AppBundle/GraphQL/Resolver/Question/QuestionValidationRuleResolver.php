<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionValidationRuleResolver implements QueryInterface
{
    public function __invoke(AbstractQuestion $question)
    {
        if ($question instanceof MultipleChoiceQuestion) {
            return $question->getValidationRule();
        }

        return null;
    }
}
