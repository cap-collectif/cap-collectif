<?php

namespace Capco\AppBundle\Processor\Opinion;

use Capco\AppBundle\Notifier\OpinionNotifier;
use Capco\AppBundle\Repository\OpinionRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class OpinionCreateProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly OpinionRepository $repository,
        private readonly OpinionNotifier $notifier
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $id = $json['opinionId'];
        $opinion = $this->repository->find($id);
        if (!$opinion) {
            throw new \RuntimeException('Unable to find opinion with id : ' . $id);
        }

        $this->notifier->onCreation($opinion);

        return true;
    }
}
