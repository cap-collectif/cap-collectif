<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\MediatorParticipantStep;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MediatorParticipantStepRepository;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class DeleteParticipantMutation implements MutationInterface
{
    use MutationTrait;
    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;
    private ParticipantRepository $participantRepository;
    private MediatorParticipantStepRepository $mediatorParticipantStepRepository;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        ParticipantRepository $participantRepository,
        MediatorParticipantStepRepository $mediatorParticipantStepRepository
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->participantRepository = $participantRepository;
        $this->mediatorParticipantStepRepository = $mediatorParticipantStepRepository;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $participantToken = $input->offsetGet('participantToken');
        $participant = $this->getParticipant($participantToken);
        $participantId = $participant->getId();

        $this->em->remove($participant);
        $this->em->flush();

        $base64ParticipantId = GlobalId::toGlobalId('Participant', $participantId);

        return ['deletedParticipantId' => $base64ParticipantId];
    }

    public function isGranted(string $mediatorId, string $participantToken, User $viewer): bool
    {
        $mediator = $this->getMediator($mediatorId, $viewer);

        if ($mediator->getUser() !== $viewer) {
            return false;
        }

        $participant = $this->getParticipant($participantToken);

        $mediatorParticipantStep = $this->mediatorParticipantStepRepository->findOneBy(['mediator' => $mediator, 'participant' => $participant]);

        if (!$mediatorParticipantStep instanceof MediatorParticipantStep) {
            return false;
        }

        return true;
    }

    private function getMediator(string $mediatorId, User $viewer): Mediator
    {
        $mediator = $this->globalIdResolver->resolve($mediatorId, $viewer);

        if (!$mediator instanceof Mediator) {
            throw new UserError("No mediator found for id {$mediatorId}");
        }

        return $mediator;
    }

    private function getParticipant(string $token): ?Participant
    {
        $participant = $this->participantRepository->findOneBy(['token' => $token]);

        if (!$participant instanceof Participant) {
            throw new UserError("No participant found for token {$token}");
        }

        return $participant;
    }
}
