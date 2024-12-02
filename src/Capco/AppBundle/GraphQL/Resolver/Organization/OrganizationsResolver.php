<?php

namespace Capco\AppBundle\GraphQL\Resolver\Organization;

use Capco\AppBundle\Repository\Organization\OrganizationRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OrganizationsResolver implements QueryInterface
{
    public function __construct(private readonly OrganizationRepository $repository)
    {
    }

    public function __invoke(User $viewer, Argument $input): ConnectionInterface
    {
        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use (
            &$totalCount,
            $viewer,
            $input
        ) {
            $results = $this->repository->findPaginated(
                $limit,
                $offset,
                $input->offsetGet('search'),
                $input->offsetGet('affiliations') ?? [],
                $viewer
            );
            $totalCount = \count($results);

            return $results;
        });

        $connection = $paginator->auto($input, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
