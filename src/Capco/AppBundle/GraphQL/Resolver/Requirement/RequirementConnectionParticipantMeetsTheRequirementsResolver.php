<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Service\ParticipantHelper;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\EdgeInterface;

class RequirementConnectionParticipantMeetsTheRequirementsResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private ViewerMeetsTheRequirementResolver $viewerMeetsTheRequirementResolver,
        private ParticipantHelper $participantHelper
    ) {
    }

    public function __invoke(ConnectionInterface $connection, Argument $args): bool
    {
        $token = $args->offsetGet('token');

        $requirements = array_map(fn ($edge) => $edge->getNode(), $connection->getEdges());

        if (empty($requirements)) {
            return true;
        }

        try {
            $participant = $this->participantHelper->getParticipantByToken($token);
        } catch (\Exception) {
            return false;
        }

        // @var EdgeInterface $edge

        foreach ($requirements as $requirement) {
            if (!$this->viewerMeetsTheRequirementResolver->__invoke($requirement, $participant)) {
                return false;
            }
        }

        return true;
    }
}
