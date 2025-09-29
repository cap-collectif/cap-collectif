<?php

namespace Capco\AppBundle\GraphQL\Resolver\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Repository\MailingListRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OrganizationMailingListsResolver implements QueryInterface
{
    public function __construct(
        private readonly MailingListRepository $repository
    ) {
    }

    public function __invoke(
        Organization $organization,
        ?Argument $args = null
    ): ConnectionInterface {
        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use (
            &$totalCount,
            $organization,
            $args
        ) {
            $results = $this->repository->findPaginatedByOwner(
                $organization,
                $limit,
                $offset,
                $args->offsetGet('term')
            );
            $totalCount = $this->repository->countByOwner($organization);

            return $results;
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
