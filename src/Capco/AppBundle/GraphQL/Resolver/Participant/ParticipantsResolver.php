<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Repository\ParticipantRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ParticipantsResolver implements QueryInterface
{
    private ParticipantRepository $participantRepository;

    public function __construct(ParticipantRepository $participantRepository)
    {
        $this->participantRepository = $participantRepository;
    }

    public function __invoke(Argument $args): ConnectionInterface
    {
        $paginator = new Paginator(
            fn (int $offset, int $limit) => $this->participantRepository->findPaginated(
                $limit,
                $offset
            )
        );

        $totalCount = $this->participantRepository->count([]);

        return $paginator->auto($args, $totalCount);
    }
}
