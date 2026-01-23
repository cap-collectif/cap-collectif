<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Service\ParticipantHelper;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class ParticipantResolver implements QueryInterface
{
    public function __construct(
        private readonly ParticipantHelper $participantHelper
    ) {
    }

    public function __invoke(Argument $args): ?Participant
    {
        $token = $args->offsetGet('token');

        if (!$token) {
            return null;
        }

        try {
            return $this->participantHelper->getParticipantByToken($token);
        } catch (ParticipantNotFoundException) {
            return null;
        } catch (\Exception $e) {
            throw new UserError($e->getMessage());
        }
    }
}
