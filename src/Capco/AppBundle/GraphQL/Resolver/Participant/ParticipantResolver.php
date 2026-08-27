<?php

namespace Capco\AppBundle\GraphQL\Resolver\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class ParticipantResolver implements QueryInterface
{
    public const CONTEXT_PARTICIPANT_ID = 'personal_data_participant_id';

    public function __construct(
        private readonly ParticipantHelper $participantHelper
    ) {
    }

    public function __invoke(Argument $args, ?\ArrayObject $context = null): ?Participant
    {
        $token = $args->offsetGet('token');

        if (!$token) {
            return null;
        }

        try {
            $participant = $this->participantHelper->getParticipantByToken($token);
            $context?->offsetSet(self::CONTEXT_PARTICIPANT_ID, $participant->getId());

            return $participant;
        } catch (ParticipantNotFoundException) {
            return null;
        } catch (\Exception $e) {
            throw new UserError($e->getMessage());
        }
    }

    public function canAccessPersonalData(
        Participant $participant,
        ?User $viewer,
        ?\ArrayObject $context = null
    ): bool {
        if (
            ($context
                && $context->offsetExists('disable_acl')
                && true === $context->offsetGet('disable_acl'))
            || ($viewer && ($viewer->hasBackOfficeAccess() || $viewer->isMediator()))
        ) {
            return true;
        }

        return $context
            && $context->offsetExists(self::CONTEXT_PARTICIPANT_ID)
            && $context->offsetGet(self::CONTEXT_PARTICIPANT_ID) === $participant->getId();
    }
}
