<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionTypeValueResolver implements ResolverInterface
{
    public function __invoke(AbstractQuestion $question): string
    {
        return $question->getType();
    }
}
