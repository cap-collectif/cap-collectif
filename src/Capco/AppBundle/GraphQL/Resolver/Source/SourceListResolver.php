<?php

namespace Capco\AppBundle\GraphQL\Resolver\Source;

use Capco\AppBundle\Repository\SourceRepository;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class SourceListResolver implements QueryInterface
{
    public function __construct(
        private readonly SourceRepository $repository
    ) {
    }

    /**
     * @return Connection|Promise
     */
    public function __invoke(Argument $argument)
    {
        $totalCount = 0;
        $paginator = new Paginator(function ($first, int $limit) use (
            $argument,
            &$totalCount
        ) {
            $search = $argument->offsetGet('term');
            $field = $argument->offsetGet('orderBy')['field'];
            $direction = $argument->offsetGet('orderBy')['direction'];
            $results = $this->repository->findPaginated(
                $search,
                $field,
                $direction,
                $first,
                $limit
            );
            $totalCount = $this->repository->getTotalSourcesBySearchQuery($search);

            return $results;
        });

        $connection = $paginator->auto($argument, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
