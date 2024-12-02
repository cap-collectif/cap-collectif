<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\GraphQL\DataLoader\Question\QuestionJumpsDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionJumpsResolver implements QueryInterface
{
    public function __construct(private readonly QuestionJumpsDataLoader $dataLoader)
    {
    }

    public function __invoke(AbstractQuestion $question, Arg $args): Promise
    {
        return $this->dataLoader->load(compact('question', 'args'));
    }
}
