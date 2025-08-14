<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Service\ParticipantHelper;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ParticipantMeetsTheRequirementResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private RequirementViewerValueResolver $resolver, private ViewerMeetsTheRequirementResolver $viewerMeetsTheRequirementResolver, private ParticipantHelper $participantHelper)
    {
    }

    public function __invoke(Requirement $requirement, Argument $args): bool
    {
        $token = $args->offsetGet('token');

        try {
            $participant = $this->participantHelper->getParticipantByToken($token);
        } catch (ParticipantNotFoundException) {
            return false;
        }

        return $this->viewerMeetsTheRequirementResolver->__invoke($requirement, $participant);
    }
}
