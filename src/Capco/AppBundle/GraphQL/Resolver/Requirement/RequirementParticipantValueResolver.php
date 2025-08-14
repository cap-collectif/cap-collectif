<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Service\ParticipantHelper;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class RequirementParticipantValueResolver implements QueryInterface
{
    public function __construct(private readonly RequirementViewerValueResolver $requirementViewerValueResolver, private readonly ParticipantHelper $participantHelper)
    {
    }

    public function __invoke(Requirement $requirement, Argument $args)
    {
        $token = $args->offsetGet('token');

        try {
            $participant = $this->participantHelper->getParticipantByToken($token);
        } catch (ParticipantNotFoundException) {
            return false;
        }

        return $this->requirementViewerValueResolver->__invoke($requirement, $participant);
    }
}
