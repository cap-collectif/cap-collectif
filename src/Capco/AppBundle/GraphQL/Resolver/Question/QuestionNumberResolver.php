<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionNumberResolver implements ResolverInterface
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

            if ($q->getType() !== AbstractQuestion::QUESTION_TYPE_SECTION) {
                $index++;
            }
        }

        return $index;
    }
}
