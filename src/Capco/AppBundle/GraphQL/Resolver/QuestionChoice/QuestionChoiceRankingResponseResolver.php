<?php

namespace Capco\AppBundle\GraphQL\Resolver\QuestionChoice;

use Capco\AppBundle\Repository\AbstractResponseRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionChoiceRankingResponseResolver implements ResolverInterface
{
    private $responseRepository;

    public function __construct(AbstractResponseRepository $responseRepository)
    {
        $this->responseRepository = $responseRepository;
    }

    public function __invoke(array $questionChoiceRanking, Arg $args): Connection
    {
        $totalCount = \count($questionChoiceRanking['responses']);

        $paginator = new Paginator(function () use ($questionChoiceRanking) {
            return $questionChoiceRanking['responses'];
        });

        return $paginator->auto($args, $totalCount);
    }
}
