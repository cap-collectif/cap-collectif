<?php

namespace Capco\AppBundle\GraphQL\Resolver\VocalContribution;

use Capco\AppBundle\Repository\VocalContributionRepository;
use Capco\UserBundle\Entity\User;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class VocalContributionConnectionResolver implements QueryInterface
{
    public function __construct(private readonly VocalContributionRepository $repository)
    {
    }

    public function __invoke(Argument $args, ?User $viewer = null): ConnectionInterface|Promise
    {
        $status = $args->offsetGet('status');
        $totalCount = $this->repository->countForAdmin($status);
        $paginator = new Paginator(fn (int $offset, int $limit) => $this->repository->findForAdmin($status, $offset, $limit));
        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
