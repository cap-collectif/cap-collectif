<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Repository\EventRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OwnerEventsResolver implements ResolverInterface
{
    private EventRepository $repository;

    public function __construct(EventRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Owner $owner, Argument $args): ConnectionInterface
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($owner) {
            return $this->repository->getByOwnerPaginated($owner, $offset, $limit);
        });

        return $paginator->auto($args, $this->repository->countByOwner($owner));
    }
}
