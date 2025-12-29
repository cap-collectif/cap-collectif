<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\AppLogRepository;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class AppLogResolver implements QueryInterface
{
    public function __construct(
        private readonly AppLogRepository $appLogRepository,
    ) {
    }

    public function __invoke(Argument $args, User $viewer): Connection|Promise
    {
        try {
            $totalCount = 0;

            $paginator = new Paginator(function ($first, int $limit) use (
                $args,
                &$totalCount
            ) {
                $term = $args->offsetGet('term');
                $actionType = $args->offsetGet('actionType');
                $userRole = $args->offsetGet('userRole');
                $direction = $args->offsetGet('orderBy');
                $dateRange = $args->offsetGet('dateRange');

                $totalCount = $this->appLogRepository->getTotalCount();

                return $this->appLogRepository->search($direction, $term, $actionType, $userRole, $dateRange, $first, $limit);
            });

            $newestLoggedAt = $this->appLogRepository->getNewestLogDate();
            $oldestLoggedAt = $this->appLogRepository->getOldestLogDate();

            $connection = $paginator->auto($args, $totalCount);
            $connection->setTotalCount($totalCount);
            $connection->oldestLoggedAt = $oldestLoggedAt;
            $connection->newestLoggedAt = $newestLoggedAt;

            return $connection;
        } catch (\Exception $e) {
            throw new UserError($e->getMessage());
        }
    }
}
