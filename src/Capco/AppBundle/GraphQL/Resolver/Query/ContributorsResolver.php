<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\UserBundle\Repository\UserRepository;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ContributorsResolver implements QueryInterface
{
    public function __construct(private readonly UserRepository $userRepository)
    {
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
            $roles = $argument->offsetGet('roles');
            $search = $argument->offsetGet('search');
            $order = $argument->offsetGet('orderBy');

            $orderMap = [
                'LAST_LOGIN' => 'last_login',
            ];

            $field = null;
            if ($order['field'] ?? null) {
                $field = $orderMap[$order['field']] ?? null;
            }

            $direction = $order['direction'] ?? 'DESC';

            $users = $this->userRepository->getContributorsWithRole(
                $roles,
                $direction,
                $field,
                $search,
            );

            $totalCount = $this->userRepository->countContributorsWithRole(
                $roles,
                $search,
            );

            return $users;
        });

        $connection = $paginator->auto($argument, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
