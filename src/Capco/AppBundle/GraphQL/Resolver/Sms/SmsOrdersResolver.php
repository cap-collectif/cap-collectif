<?php

namespace Capco\AppBundle\GraphQL\Resolver\Sms;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\SmsOrderRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class SmsOrdersResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private readonly SmsOrderRepository $repository
    ) {
    }

    public function __invoke(Argument $args): ConnectionInterface
    {
        $filter = $args->offsetGet('filter') ?? null;
        $paginator = new Paginator(fn (int $offset, int $limit) => $this->repository->findPaginated(
            $offset,
            $limit,
            $filter
        ));

        return $paginator->auto($args, $this->repository->countAll($filter));
    }
}
