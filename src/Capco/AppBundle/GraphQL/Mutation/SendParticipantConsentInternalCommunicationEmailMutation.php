<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Exception\RecentlySentException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Service\EmailRateLimiter;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ParticipationWorkflow\ParticipationCookieManager;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class SendParticipantConsentInternalCommunicationEmailMutation implements MutationInterface
{
    use MutationTrait;

    public const EMAIL_RECENTLY_SENT = 'EMAIL_RECENTLY_SENT';

    public function __construct(
        private readonly Publisher $publisher,
        private readonly ParticipantHelper $participantHelper,
        private readonly ParticipationCookieManager $participationCookieManager,
        private readonly EmailRateLimiter $emailRateLimiter
    ) {
    }

    /**
     * @throws ParticipantNotFoundException
     *
     * @return array{'participant': Participant}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $email = $input->offsetGet('email');
        $token = $input->offsetGet('participantToken');

        $participant = $this->participantHelper->getParticipantByToken($token);

        try {
            $this->rateLimit($email);
        } catch (RecentlySentException) {
            return ['errorCode' => self::EMAIL_RECENTLY_SENT, 'participant' => $participant];
        }

        $body = json_encode([
            'email' => $email,
            'token' => $token,
            'consent_internal_communication' => $participant->isConsentInternalCommunication(),
            'participation_cookies' => $this->participationCookieManager->all(),
        ]);

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::PARTICIPANT_CONSENT_INTERNAL_COMMUNICATION_EMAIL,
            new Message(
                $body ?: null
            )
        );

        return ['participant' => $participant];
    }

    private function rateLimit(string $email): void
    {
        $encodedEmail = base64_encode($email);
        $cacheKey = "consent_internal_communication.email.{$encodedEmail}";
        $this->emailRateLimiter->rateLimit($cacheKey);
    }
}
