<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\UserInviteRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QueryUserInvitationsResolver implements ResolverInterface
{
    use ResolverTrait;

    private UserInviteRepository $repository;

    public function __construct(UserInviteRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $args): ConnectionInterface
    {
        $this->protectArguments($args);

        return $this->getConnection($args);
    }

    public function getConnection(Argument $args): ConnectionInterface
    {
        $totalCount = 0;

        $paginator = new Paginator(function (int $offset, int $limit) use (&$totalCount) {
            $results = $this->repository->findPaginated($limit, $offset);

            $totalCount = \count($results);

            return $results;
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
