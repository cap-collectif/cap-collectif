<?php

namespace Capco\AppBundle\Processor\Opinion;

use Capco\AppBundle\Notifier\OpinionNotifier;
use Capco\AppBundle\Repository\OpinionRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class OpinionTrashProcessor implements ProcessorInterface
{
    private $opinionRepository;
    private $opinionNotifier;

    public function __construct(
        OpinionRepository $opinionRepository,
        OpinionNotifier $opinionNotifier
    ) {
        $this->opinionRepository = $opinionRepository;
        $this->opinionNotifier = $opinionNotifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $opinion = $this->opinionRepository->find($json['opinionId']);
        if (!$opinion) {
            throw new \RuntimeException('Unable to find opinion with id : ' . $json['opinionId']);
        }
        $this->opinionNotifier->onTrash($opinion);

        return true;
    }
}
