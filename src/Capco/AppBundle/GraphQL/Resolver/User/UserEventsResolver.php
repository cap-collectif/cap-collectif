<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\EventRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserEventsResolver implements ResolverInterface
{
    protected $eventRepo;

    public function __construct(EventRepository $eventRepo)
    {
        $this->eventRepo = $eventRepo;
    }

    public function __invoke(User $user, Argument $args): Connection
    {
        $field = $args->offsetGet('orderBy')['field'];
        $direction = $args->offsetGet('orderBy')['direction'];

        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $user,
            $field,
            $direction
        ) {
            return $this->eventRepo->findAllByUser($user, $field, $direction);
        });

        $totalCount = $this->eventRepo->countAllByUser($user);

        return $paginator->auto($args, $totalCount);
    }
}
