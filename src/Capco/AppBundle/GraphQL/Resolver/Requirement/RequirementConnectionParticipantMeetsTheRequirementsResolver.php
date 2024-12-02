<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ParticipantRepository;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\EdgeInterface;

class RequirementConnectionParticipantMeetsTheRequirementsResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private readonly ParticipantRepository $participantRepository, private readonly ViewerMeetsTheRequirementResolver $viewerMeetsTheRequirementResolver)
    {
    }

    public function __invoke(ConnectionInterface $connection, Argument $args): bool
    {
        $token = $this->getToken($args);

        $participant = $this->getParticipant($token);

        /** * @var EdgeInterface $edge  */
        $requirements = array_map(function ($edge) {
            return $edge->getNode();
        }, $connection->getEdges());

        foreach ($requirements as $requirement) {
            if (!$this->viewerMeetsTheRequirementResolver->__invoke($requirement, $participant)) {
                return false;
            }
        }

        return true;
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
