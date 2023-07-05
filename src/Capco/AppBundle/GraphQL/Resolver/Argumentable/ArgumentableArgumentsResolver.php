<?php

namespace Capco\AppBundle\GraphQL\Resolver\Argumentable;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Model\Argumentable;
use Capco\AppBundle\Search\ArgumentSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ArgumentableArgumentsResolver implements ResolverInterface
{
    private ArgumentSearch $argumentSearch;

    public function __construct(ArgumentSearch $argumentSearch)
    {
        $this->argumentSearch = $argumentSearch;
    }

    public function __invoke(Argumentable $argumentable, Argument $args): ConnectionInterface
    {
        $filters = self::getFilters($args);
        $orderBy = self::getOrderBy($args);

        $totalCount = 0;
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $argumentable,
            $filters,
            $orderBy,
            &$totalCount
        ) {
            $response = $this->argumentSearch->searchArguments(
                $argumentable,
                $limit,
                $orderBy,
                $filters,
                $cursor
            );
            $totalCount = $response->getTotalCount();

            return $response;
        });

        $connection = $paginator->auto($args);
        $connection->setTotalCount($totalCount);

        return $connection;
    }

    public static function getFilters(Argument $args): array
    {
        $filters = [];
        if ($args->offsetExists('type')) {
            $filters['voteType'] = $args->offsetGet('type');
        }

        $filters['isTrashed'] = false;
        if ($args->offsetExists('includeTrashed') && $args->offsetGet('includeTrashed')) {
            $filters['isTrashed'] = null;
        }

        return $filters;
    }

    public static function getOrderBy(Argument $args): ?array
    {
        $orderBy = $args->offsetGet('orderBy');
        if (null === $orderBy) {
            $orderBy = [
                'field' => 'PUBLISHED_AT',
                'direction' => 'DESC',
            ];
        }

        $orderByFields = [
            'PUBLISHED_AT' => 'publishedAt',
            'VOTES' => 'votesCount',
        ];
        $orderBy['field'] = $orderByFields[$orderBy['field']];

        return $orderBy;
    }
}
