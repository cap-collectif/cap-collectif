<?php

namespace Capco\AppBundle\GraphQL\Resolver\QuestionChoice;

use Capco\AppBundle\Repository\AbstractResponseRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionChoiceRankingResponseResolver implements QueryInterface
{
    public function __construct(
        private readonly AbstractResponseRepository $responseRepository
    ) {
    }

    public function __invoke(array $questionChoiceRanking, Arg $args): Connection
    {
        $totalCount = \count($questionChoiceRanking['responses']);

        $paginator = new Paginator(fn () => $questionChoiceRanking['responses']);

        return $paginator->auto($args, $totalCount);
    }
}
