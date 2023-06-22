<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\GraphQL\DataLoader\Question\QuestionJumpsDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionJumpsResolver implements ResolverInterface
{
    private $dataLoader;

    public function __construct(QuestionJumpsDataLoader $dataLoader)
    {
        $this->dataLoader = $dataLoader;
    }

    public function __invoke(AbstractQuestion $question, Arg $args): Promise
    {
        return $this->dataLoader->load(compact('question', 'args'));
    }
}
