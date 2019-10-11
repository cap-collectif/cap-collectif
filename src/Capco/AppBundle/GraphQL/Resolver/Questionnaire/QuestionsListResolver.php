<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionsListResolver implements ResolverInterface
{
    public function __invoke(Questionnaire $questionnaire): array
    {
        $questions = $questionnaire->getRealQuestions()->toArray();
        usort($questions, function ($a, $b) {
            return $a->getQuestionnaireAbstractQuestion()->getPosition() <=>
                $b->getQuestionnaireAbstractQuestion()->getPosition();
        });

        return $questions;
    }
}
