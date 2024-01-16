<?php

namespace Capco\AppBundle\GraphQL\Resolver\Source;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Search\VoteSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class SourceVotesResolver implements QueryInterface
{
    private VoteSearch $voteSearch;

    public function __construct(VoteSearch $voteSearch)
    {
        $this->voteSearch = $voteSearch;
    }

    public function __invoke(Source $source, ?Arg $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument([
                'first' => 0,
            ]);
        }

        $totalCount = 0;
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $source,
            &$totalCount
        ) {
            $response = $this->voteSearch->searchSourceVotes($source, $limit, $cursor);
            $totalCount = $response->getTotalCount();

            return $response;
        });

        $connection = $paginator->auto($args);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
