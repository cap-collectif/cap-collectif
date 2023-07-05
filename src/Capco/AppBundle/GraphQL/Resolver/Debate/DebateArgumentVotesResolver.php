<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Interfaces\DebateArgumentInterface;
use Capco\AppBundle\Search\VoteSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class DebateArgumentVotesResolver implements ResolverInterface
{
    public const ORDER_PUBLISHED_AT = 'PUBLISHED_AT';

    private VoteSearch $voteSearch;

    public function __construct(VoteSearch $voteSearch)
    {
        $this->voteSearch = $voteSearch;
    }

    public function __invoke(
        DebateArgumentInterface $debateArgument,
        ?Argument $args = null
    ): ConnectionInterface {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }
        $orderBy = self::getOrderBy($args);

        $totalCount = 0;
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $debateArgument,
            &$totalCount,
            $orderBy
        ) {
            $response = $this->voteSearch->searchDebateArgumentVotes(
                $debateArgument,
                $limit,
                $orderBy,
                $cursor
            );
            $totalCount = $response->getTotalCount();

            return $response;
        });

        $connection = $paginator->auto($args);
        $connection->setTotalCount($totalCount);

        return $connection;
    }

    private static function getOrderBy(Argument $args): ?array
    {
        $orderByFields = [
            'PUBLISHED_AT' => 'publishedAt',
        ];
        $orderBy = $args->offsetGet('orderBy');
        if ($orderBy) {
            $orderBy['field'] = $orderByFields[$orderBy['field']];
        }

        return $orderBy;
    }
}
