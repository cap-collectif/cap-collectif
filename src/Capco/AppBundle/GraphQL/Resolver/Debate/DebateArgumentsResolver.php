<?php

namespace Capco\AppBundle\GraphQL\Resolver\Debate;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Enum\ForOrAgainstType;
use Capco\AppBundle\Search\DebateSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class DebateArgumentsResolver implements QueryInterface
{
    final public const ORDER_PUBLISHED_AT = 'PUBLISHED_AT';
    final public const ORDER_VOTE_COUNT = 'VOTE_COUNT';

    public function __construct(
        private readonly DebateSearch $debateSearch
    ) {
    }

    public function __invoke(Debate $debate, Argument $args, ?User $viewer): ConnectionInterface
    {
        $filters = self::getFilters($args, $viewer);
        $orderBy = self::getOrderBy($args);

        $paginator = new ElasticsearchPaginator(
            fn (?string $cursor, int $limit) => $this->debateSearch->searchDebateArguments(
                $debate,
                $limit,
                $orderBy,
                $filters,
                $cursor
            )
        );

        return $paginator->auto($args);
    }

    public static function getFilters(Argument $args, ?User $viewer, ?string $value = null): array
    {
        $filters = [];
        if ($args->offsetExists('value')) {
            $filters['value'] = $args->offsetGet('value');
        }

        if (null === $viewer || !$viewer->isAdmin()) {
            $filters['isPublished'] = true;
        } else {
            $filters['isPublished'] = $args->offsetGet('isPublished');
        }

        if (null === $viewer || !$viewer->isAdmin()) {
            $filters['isTrashed'] = false;
        } else {
            $filters['isTrashed'] = $args->offsetGet('isTrashed');
        }

        if ($value && ForOrAgainstType::isValid($value)) {
            $filters['value'] = $value;
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
            'VOTE_COUNT' => 'votesCount',
        ];
        $orderBy['field'] = $orderByFields[$orderBy['field']];

        return $orderBy;
    }
}
