<?php

namespace Capco\AppBundle\GraphQL\Resolver\Argument;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Search\VoteSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ArgumentVotesResolver implements QueryInterface
{
    public function __construct(private readonly VoteSearch $voteSearch)
    {
    }

    public function __invoke(Argument $argument, ?Arg $args = null): ConnectionInterface
    {
        if (null === $args) {
            $args = new Arg([
                'first' => 0,
            ]);
        }

        $totalCount = 0;
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $argument,
            &$totalCount
        ) {
            $response = $this->voteSearch->searchArgumentVotes($argument, $limit, $cursor);
            $totalCount = $response->getTotalCount();

            return $response;
        });

        $connection = $paginator->auto($args);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
