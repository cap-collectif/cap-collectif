<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\MediatorParticipantStep;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MediatorParticipantStepRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class DeleteParticipantMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private EntityManagerInterface $em, private GlobalIdResolver $globalIdResolver, private MediatorParticipantStepRepository $mediatorParticipantStepRepository, private ParticipantHelper $participantHelper)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $participantToken = $input->offsetGet('participantToken');

        try {
            $participant = $this->participantHelper->getParticipantByToken($participantToken);
        } catch (ParticipantNotFoundException $e) {
            throw new UserError($e->getMessage());
        }

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

        try {
            $participant = $this->participantHelper->getParticipantByToken($participantToken);
        } catch (ParticipantNotFoundException $e) {
            throw new UserError($e->getMessage());
        }

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
}
