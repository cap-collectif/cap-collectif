<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Repository\ParticipantRepository;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class RequirementParticipantValueResolver implements QueryInterface
{
    public function __construct(private readonly RequirementViewerValueResolver $requirementViewerValueResolver, private readonly ParticipantRepository $participantRepository)
    {
    }

    public function __invoke(Requirement $requirement, Argument $args)
    {
        $token = $this->getToken($args);
        $participant = $this->getParticipant($token);

        return $this->requirementViewerValueResolver->__invoke($requirement, $participant);
    }

    public function getParticipant(string $token): Participant
    {
        $participant = $this->participantRepository->findOneBy(['token' => $token]);

        if (!$participant instanceof Participant) {
            throw new UserError("Participant not found given the token : {$token}");
        }

        return $participant;
    }

    public function getToken(Argument $args): string
    {
        $token = $args->offsetGet('token');

        if (!$token) {
            throw new UserError('Token not found');
        }

        return $token;
    }
}
