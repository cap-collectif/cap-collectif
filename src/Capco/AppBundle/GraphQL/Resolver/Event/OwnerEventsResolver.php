<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Repository\EventRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OwnerEventsResolver implements QueryInterface
{
    public function __construct(private readonly EventRepository $repository, private readonly EntityManagerInterface $em)
    {
    }

    public function __invoke(Owner $owner, Argument $args): ConnectionInterface
    {
        $status = $args->offsetGet('status');
        $query = $args->offsetGet('search');
        $hideDeletedEvents = $args->offsetGet('hideDeletedEvents');
        $hideUnpublishedEvents = $args->offsetGet('hideUnpublishedEvents');
        $isFuture = $args->offsetGet('isFuture');
        $emFilters = $this->em->getFilters();
        $emFilters->enable('softdeleted');
        if (!$hideDeletedEvents) {
            $emFilters->disable('softdeleted');
        }

        $options = [];
        if ($status) {
            $options['status'] = $status;
        }
        if ($query) {
            $options['query'] = $query;
        }
        if ($hideUnpublishedEvents) {
            $options['hideUnpublishedEvents'] = $hideUnpublishedEvents;
        }
        if (null !== $isFuture) {
            $options['isFuture'] = $isFuture;
        }

        $paginator = new Paginator(function (int $offset, int $limit) use ($owner, $options) {
            return $this->repository->getByOwnerPaginated($owner, $offset, $limit, $options);
        });

        $count = $this->repository->countByOwner($owner, $options);

        $paginatedEvents = $paginator->auto($args, $count);

        if (false === $emFilters->isEnabled('softdeleted')) {
            $emFilters->enable('softdeleted');
        }

        return $paginatedEvents;
    }
}
