<?php

namespace Capco\AppBundle\GraphQL\Resolver\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\PostOrderField;
use Capco\AppBundle\Repository\PostRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OrganizationPostsResolver implements QueryInterface
{
    public function __construct(private readonly PostRepository $repository)
    {
    }

    public function __invoke(Organization $organization, Argument $argument): ConnectionInterface
    {
        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use (
            &$totalCount,
            $organization,
            $argument
        ) {
            $query = $argument->offsetGet('query');
            $orderByField = $argument->offsetGet('orderBy')['field'] ?? PostOrderField::UPDATED_AT;
            $orderByDirection = $argument->offsetGet('orderBy')['direction'] ?? OrderDirection::DESC;
            $hideUnpublishedPosts = $argument->offsetGet('hideUnpublishedPosts');

            $options = compact('query', 'orderByField', 'orderByDirection', 'hideUnpublishedPosts');

            $results = $this->repository->getByOwner(
                $organization,
                $offset,
                $limit,
                $options
            );
            $totalCount = $this->repository->countByOwner($organization, $options);

            return $results;
        });

        $connection = $paginator->auto($argument, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
