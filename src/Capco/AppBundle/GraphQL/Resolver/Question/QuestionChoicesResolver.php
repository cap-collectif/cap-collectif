<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\GraphQL\DataLoader\Question\QuestionChoicesDataLoader;
use Capco\AppBundle\Search\Search;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class QuestionChoicesResolver implements QueryInterface
{
    private $dataLoader;

    public function __construct(QuestionChoicesDataLoader $dataLoader)
    {
        $this->dataLoader = $dataLoader;
    }

    public function __invoke(
        AbstractQuestion $question,
        Arg $args,
        $viewer,
        RequestStack $request
    ): Promise {
        $seed = Search::generateSeed($request, $viewer);

        return $this->dataLoader->load(compact('question', 'args', 'seed'));
    }
}
