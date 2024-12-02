<?php

namespace Capco\AppBundle\GraphQL\Resolver\Sms;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class SmsCreditsResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private readonly SmsCreditRepository $repository)
    {
    }

    public function __invoke(Argument $args): ConnectionInterface
    {
        $paginator = new Paginator(function (int $offset, int $limit) {
            return $this->repository->findPaginated(
                $offset,
                $limit,
            );
        });

        return $paginator->auto($args, $this->repository->countAll());
    }
}
