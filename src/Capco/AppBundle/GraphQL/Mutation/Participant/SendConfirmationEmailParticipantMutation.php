<?php

namespace Capco\AppBundle\GraphQL\Mutation\Participant;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Service\ParticipationWorkflow\ConfirmationParticipationParticipantEmailSender;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class SendConfirmationEmailParticipantMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private ConfirmationParticipationParticipantEmailSender $confirmationParticipationParticipantEmailSender)
    {
    }

    /**
     * @return array{'errorCode': string|null}
     */
    public function __invoke(Argument $argument): array
    {
        $this->formatInput($argument);

        $token = $argument->offsetGet('token');
        $email = $argument->offsetGet('email');
        $redirectUrl = $argument->offsetGet('redirectUrl');

        return $this->confirmationParticipationParticipantEmailSender->send($token, $email, $redirectUrl);
    }
}
