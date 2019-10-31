<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\GraphQL\DataLoader\Question\QuestionChoicesDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionChoicesResolver implements ResolverInterface
{
    private $dataLoader;

    public function __construct(QuestionChoicesDataLoader $dataLoader)
    {
        $this->dataLoader = $dataLoader;
    }

    public function __invoke(AbstractQuestion $question, Arg $args): Promise
    {
        return $this->dataLoader->load(compact('question', 'args'));
    }
}
