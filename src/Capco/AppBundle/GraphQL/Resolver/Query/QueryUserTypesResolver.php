<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\UserTypeOrderField;
use Capco\UserBundle\Repository\UserTypeRepository;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class QueryUserTypesResolver implements QueryInterface
{
    public function __construct(
        private readonly UserTypeRepository $userTypeRepository,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function __invoke(Argument $args): ConnectionInterface|Promise
    {
        try {
            $total = $this->userTypeRepository->count([]);
        } catch (\Throwable $e) {
            $this->logger->error(sprintf('Error while counting userTypes: %s', $e->getMessage()));
            $total = 0;
        }

        $orderBy = $args->offsetGet('orderBy') ?? [
            'field' => UserTypeOrderField::UPDATED_AT,
            'direction' => OrderDirection::DESC,
        ];

        $paginator = new Paginator(function (int $offset, int $limit) use ($total, $orderBy) {
            if (0 === $total) {
                return [];
            }

            return $this->userTypeRepository->findAllPaginated($offset, $limit, $orderBy);
        });

        return $paginator->auto($args, $total);
    }
}
