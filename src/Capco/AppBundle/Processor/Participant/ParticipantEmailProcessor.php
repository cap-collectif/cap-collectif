<?php

namespace Capco\AppBundle\Processor\Participant;

use Capco\AppBundle\Notifier\Participant\ParticipantNotifier;
use Capco\AppBundle\Repository\ParticipantRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ParticipantEmailProcessor implements ProcessorInterface
{
    public function __construct(private readonly ParticipantRepository $participantRepository, private readonly ParticipantNotifier $notifier)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $participant = $this->participantRepository->find($json['participantId']);
        $redirectUrl = $json['redirectUrl'];
        $partipationCookies = $json['participationCookies'];

        if (!$participant) {
            throw new \RuntimeException('Unable to find participant with id : ' . $json['participantId']);
        }

        $this->notifier->sendEmailConfirmation($participant, $redirectUrl, $partipationCookies);

        return true;
    }
}
