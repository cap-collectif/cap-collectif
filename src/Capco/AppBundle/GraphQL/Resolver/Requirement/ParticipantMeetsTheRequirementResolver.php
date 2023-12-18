<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ParticipantRepository;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ParticipantMeetsTheRequirementResolver implements ResolverInterface
{
    use ResolverTrait;

    private RequirementViewerValueResolver $resolver;
    private ParticipantRepository $participantRepository;
    private ViewerMeetsTheRequirementResolver $viewerMeetsTheRequirementResolver;

    public function __construct(RequirementViewerValueResolver $resolver, ParticipantRepository $participantRepository, ViewerMeetsTheRequirementResolver $viewerMeetsTheRequirementResolver)
    {
        $this->resolver = $resolver;
        $this->participantRepository = $participantRepository;
        $this->viewerMeetsTheRequirementResolver = $viewerMeetsTheRequirementResolver;
    }

    public function __invoke(Requirement $requirement, Argument $args): bool
    {
        $token = $this->getToken($args);

        $participant = $this->getParticipant($token);

        return $this->viewerMeetsTheRequirementResolver->__invoke($requirement, $participant);
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
