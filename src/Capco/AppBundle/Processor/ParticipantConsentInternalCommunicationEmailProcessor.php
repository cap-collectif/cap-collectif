<?php

namespace Capco\AppBundle\Processor;

use Capco\AppBundle\Notifier\ParticipantConsentInternalCommunicationEmailNotifier;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ParticipantConsentInternalCommunicationEmailProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly ParticipantConsentInternalCommunicationEmailNotifier $notifier,
        private readonly RouterInterface $router
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $email = $json['email'];
        $token = $json['token'];
        $consentInternalCommunication = $json['consent_internal_communication'] ?? null;
        $participationCookies = $json['participation_cookies'] ?? null;

        if ($consentInternalCommunication) {
            $redirectUrl = $this->router->generate('app_homepage', [
                'participationCookies' => $participationCookies,
            ], UrlGeneratorInterface::ABSOLUTE_URL);

            $this->notifier->sendRegisterEmail($email, $redirectUrl);
        } else {
            $confirmationUrl = $this->router->generate(
                'participant_consent_internal_communication',
                ['email' => $email, 'token' => $token],
                UrlGeneratorInterface::ABSOLUTE_URL
            );

            $this->notifier->sendConfirmConsentInternalCommunicationEmail($email, $confirmationUrl);
        }

        return true;
    }
}
