<?php

namespace Capco\AppBundle\GraphQL\Resolver\Mediator;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Repository\ParticipantRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class MediatorTotalParticipantsOptInResolver implements QueryInterface
{
    public function __construct(private readonly ParticipantRepository $participantRepository)
    {
    }

    public function __invoke(Mediator $mediator): int
    {
        return $this->participantRepository->countTotalOptInByMediator($mediator);
    }
}
