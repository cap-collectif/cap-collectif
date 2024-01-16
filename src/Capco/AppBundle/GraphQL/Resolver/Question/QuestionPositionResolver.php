<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionPositionResolver implements QueryInterface
{
    public function __invoke(AbstractQuestion $question): int
    {
        return $question->getQuestionnaireAbstractQuestion()->getPosition();
    }
}
