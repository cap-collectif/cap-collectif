<?php

namespace Capco\AppBundle\GraphQL\Resolver\Mediator;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Repository\ParticipantRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class MediatorTotalParticipantsAccountedResolver implements ResolverInterface
{
    private ParticipantRepository $participantRepository;

    public function __construct(
        ParticipantRepository $participantRepository
    ) {
        $this->participantRepository = $participantRepository;
    }

    public function __invoke(Mediator $mediator): int
    {
        return $this->participantRepository->countTotalAccountedByMediator($mediator);
    }
}
