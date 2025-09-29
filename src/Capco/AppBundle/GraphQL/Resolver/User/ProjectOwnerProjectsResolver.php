<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\ProjectOrderField;
use Capco\AppBundle\Search\ProjectSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ProjectOwnerProjectsResolver implements QueryInterface
{
    public function __construct(
        private readonly ProjectSearch $projectSearch
    ) {
    }

    public function __invoke(User $user, ?Argument $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument([
                'first' => 0,
                'affiliations' => ['AUTHOR'],
            ]);
        }

        $affiliations = $args['affiliations'];
        $query = $args->offsetGet('query');
        $searchFields = $args->offsetGet('searchFields') ?? [];

        $orderByField = $args->offsetGet('orderBy')['field'] ?? ProjectOrderField::PUBLISHED_AT;
        $orderByDirection = $args->offsetGet('orderBy')['direction'] ?? OrderDirection::DESC;

        $filters = $this->getFilters($args);
        $orderBy = ['field' => $orderByField, 'direction' => $orderByDirection];

        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use (
            $affiliations,
            $query,
            $orderBy,
            $filters,
            $user,
            &$totalCount,
            $searchFields
        ) {
            $response = $this->projectSearch->searchProjects(
                $offset,
                $limit,
                $orderBy,
                $query,
                $filters,
                $affiliations,
                $user,
                $searchFields
            );
            $totalCount = $response['count'];

            return $response['projects'];
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }

    private function getFilters(Argument $args): array
    {
        $filters = [];
        if ($args->offsetExists('status') && '' !== $args['status']) {
            $filters['projectStatus'] = $args->offsetGet('status');
        }

        return $filters;
    }
}
