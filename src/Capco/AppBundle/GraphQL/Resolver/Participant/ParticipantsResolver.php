<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ParticipantsResolver implements QueryInterface
{
    public function __construct(
        private readonly ParticipantRepository $participantRepository
    ) {
    }

    public function __invoke(Argument $args): ConnectionInterface
    {
        $consentInternalCommunication = $args->offsetGet('consentInternalCommunication');
        $emailConfirmed = $args->offsetGet('emailConfirmed');

        $paginator = new Paginator(
            fn (int $offset, int $limit) => $this->participantRepository->findPaginated(
                $limit,
                $offset,
                $consentInternalCommunication,
                $emailConfirmed
            )
        );

        $totalCount = $this->participantRepository->countWithFilters($consentInternalCommunication, $emailConfirmed);

        return $paginator->auto($args, $totalCount);
    }

    public function isGranted(?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        return $viewer->hasBackOfficeAccess();
    }
}
