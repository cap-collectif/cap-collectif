<?php

namespace Capco\AppBundle\Processor\Opinion;

use Capco\AppBundle\Notifier\OpinionNotifier;
use Capco\AppBundle\Repository\OpinionRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class OpinionUpdateProcessor implements ProcessorInterface
{
    public function __construct(private readonly OpinionRepository $opinionRepository, private readonly OpinionNotifier $opinionNotifier)
    {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $opinion = $this->opinionRepository->find($json['opinionId']);
        if (!$opinion) {
            throw new \RuntimeException('Unable to find opinion with id : ' . $json['opinionId']);
        }
        $this->opinionNotifier->onUpdate($opinion);

        return true;
    }
}
