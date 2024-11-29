<?php

namespace Capco\AppBundle\Processor\Argument;

use Capco\AppBundle\Notifier\ArgumentNotifier;
use Capco\AppBundle\Repository\ArgumentRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ArgumentCreateProcessor implements ProcessorInterface
{
    private $repository;
    private $notifier;

    public function __construct(ArgumentRepository $repository, ArgumentNotifier $notifier)
    {
        $this->repository = $repository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $id = $json['argumentId'];
        $argument = $this->repository->find($id);
        if (!$argument) {
            throw new \RuntimeException('Unable to find argument with id : ' . $id);
        }

        $this->notifier->onCreation($argument);

        return true;
    }
}
