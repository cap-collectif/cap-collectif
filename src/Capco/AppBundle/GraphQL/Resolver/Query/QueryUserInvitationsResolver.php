<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\UserInviteRepository;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QueryUserInvitationsResolver implements QueryInterface
{
    use ResolverTrait;

    private UserInviteRepository $repository;

    public function __construct(UserInviteRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $args, ResolveInfo $info): ConnectionInterface
    {
        $this->protectArguments($args);
        $fields = $info->getFieldSelection();
        // If the only field requested is totalCount we set the arg 'first' to 0 to retrieve all invitations.
        if (\array_key_exists('totalCount', $fields) && 1 === \count($fields)) {
            $args->offsetSet('first', 0);
        }

        return $this->getConnection($args);
    }

    public function getConnection(Argument $args): ConnectionInterface
    {
        $totalCount = 0;
        $term = $args->offsetGet('term');
        $status = $args->offsetGet('status');

        if (0 === $args->offsetGet('first')) {
            $totalCount = $this->repository->getInvitationsCount($status)[0][1] ?? 0;
            $paginator = new Paginator(function (int $offset, int $limit) {
                return [];
            });

            $connection = $paginator->auto($args, $totalCount);
            $connection->setTotalCount($totalCount);

            return $connection;
        }

        $paginator = new Paginator(function (int $offset, int $limit) use (
            &$totalCount,
            $term,
            $status
        ) {
            $results = $this->repository->findPaginated($limit, $offset, $term, $status);
            $totalCount = \count($results);

            return $results;
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
