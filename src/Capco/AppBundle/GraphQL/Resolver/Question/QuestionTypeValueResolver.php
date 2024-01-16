<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionTypeValueResolver implements QueryInterface
{
    public function __invoke(AbstractQuestion $question): string
    {
        return $question->getType();
    }
}
