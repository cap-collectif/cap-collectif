<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionNumberResolver implements QueryInterface
{
    public function __invoke(AbstractQuestion $question): int
    {
        $index = 1;
        $questionnaire = $question->getQuestionnaire();
        if (!$questionnaire) {
            return $index;
        }
        $questions = $questionnaire->getRealQuestions();

        foreach ($questions as $q) {
            if ($question->getId() === $q->getId()) {
                return $index;
            }

            if (AbstractQuestion::QUESTION_TYPE_SECTION !== $q->getType()) {
                ++$index;
            }
        }

        return $index;
    }
}
