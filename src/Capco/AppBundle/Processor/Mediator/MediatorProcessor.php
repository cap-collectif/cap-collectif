<?php

namespace Capco\AppBundle\Processor\Mediator;

use Capco\AppBundle\Notifier\Mediator\MediatorNotifier;
use Capco\AppBundle\Repository\MediatorRepository;
use Capco\AppBundle\Repository\ParticipantRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class MediatorProcessor implements ProcessorInterface
{
    public function __construct(private readonly MediatorNotifier $notifier, private readonly MediatorRepository $mediatorRepository, private readonly ParticipantRepository $participantRepository)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);

        if (!$json['canBeProcessed']) {
            return false;
        }

        $mediatorId = $json['mediatorId'];
        $participantId = $json['participantId'];
        $mediator = $this->mediatorRepository->find($mediatorId);
        if (!$mediator) {
            throw new \RuntimeException('Unable to find mediator with id : ' . $mediatorId);
        }

        $participant = $this->participantRepository->find($participantId);
        if (!$participant) {
            throw new \RuntimeException('Unable to find participant with id : ' . $participantId);
        }

        $this->notifier->onMediatorAddNewParticipant($mediator, $participant);

        return true;
    }
}
