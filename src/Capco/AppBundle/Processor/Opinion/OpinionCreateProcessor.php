<?php

namespace Capco\AppBundle\Processor\Opinion;

use Capco\AppBundle\Notifier\OpinionNotifier;
use Capco\AppBundle\Repository\OpinionRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class OpinionCreateProcessor implements ProcessorInterface
{
    private $repository;
    private $notifier;

    public function __construct(OpinionRepository $repository, OpinionNotifier $notifier)
    {
        $this->repository = $repository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options)
    {
        $json = json_decode($message->getBody(), true);
        $opinion = $this->repository->find($json['opinionId']);
        $this->notifier->onCreation($opinion);

        return true;
    }
}
