<?php

namespace Capco\AppBundle\GraphQL\Resolver\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class EventDistrictsResolver implements QueryInterface
{
    private GlobalDistrictRepository $globalDistrictRepository;

    public function __construct(GlobalDistrictRepository $globalDistrictRepository)
    {
        $this->globalDistrictRepository = $globalDistrictRepository;
    }

    public function __invoke(
        Event $event,
        Argument $args
    ): ConnectionInterface {
        $totalCount = $this->globalDistrictRepository->countByEvent($event);
        $paginator = new Paginator(function (int $offset, int $limit) use ($event) {
            return $this->globalDistrictRepository->findByEvent($event, $offset, $limit);
        });

        return $paginator->auto($args, $totalCount);
    }
}
